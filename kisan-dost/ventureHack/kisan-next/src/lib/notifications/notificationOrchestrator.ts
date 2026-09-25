/**
 * notificationOrchestrator.ts
 * ============================================================================
 * Multi-Modal Notification Orchestration Pipeline for KisanDost Phase 10.
 * Coordinates:
 *   Advisory / Risk / Expert Event
 *       ↓
 *   Notification Policy & Suppression
 *       ↓
 *   Language Selection (hi-IN, gu-IN, mr-IN)
 *       ↓
 *   Deterministic Text Rendering
 *       ↓
 *   Optional Voice Synthesis (Vexyl-TTS)
 *       ↓
 *   Channel Selection & Multi-Dispatch (FCM, WhatsApp, SMS, Voice)
 *       ↓
 *   Audit Persistence (LocalizedNotification)
 * ============================================================================
 */

import connectDB from '../mongodb';
import { User, IUser } from '@/models/User';
import { LocalizedNotification, DeliveryChannel, LocalizedDeliveryStatus } from '@/models/LocalizedNotification';
import { StructuredAdvisoryPayload } from '../advisory/advisoryNarrative';
import { renderLocalizedAdvisory, LocalizedAdvisoryResult } from '../i18n/advisoryRenderer';
import { resolveTtsLanguage, IndicLanguageCode, VoiceStyle } from '../tts/ttsConfig';
import { sendFcm } from './fcmProvider';
import { sendWhatsAppTemplate, sendWhatsAppMessage } from './whatsappProvider';
import { getWhatsAppContentSid, WhatsAppTemplateKey } from './whatsappTemplates';
import { sendSms, isSmsEnabled } from './smsProvider';
import { generateAdvisoryVoice } from './voiceProvider';

export interface OrchestrateNotificationParams {
  farmerId: string;
  sourceType: 'RISK_EVENT' | 'ADVISORY' | 'EXPERT_TICKET' | 'MANUAL';
  sourceId: string;
  payload: StructuredAdvisoryPayload;
  preferredLanguage?: string;
  requestedChannels?: DeliveryChannel[];
  generateVoice?: boolean;
  skipSuppression?: boolean;
}

export interface OrchestrationResult {
  success: boolean;
  farmerId: string;
  language: IndicLanguageCode;
  localizedText: LocalizedAdvisoryResult;
  channelsAttempted: DeliveryChannel[];
  channelsDelivered: DeliveryChannel[];
  audioUrl?: string;
  audioAssetId?: string;
  deliveryDetails: Record<DeliveryChannel, {
    status: LocalizedDeliveryStatus;
    providerMessageId?: string;
    error?: string;
  }>;
  auditIds: string[];
}

/**
 * Orchestrates multi-modal, multilingual advisory delivery according to policy.
 */
export async function orchestrateAdvisoryDelivery(
  params: OrchestrateNotificationParams
): Promise<OrchestrationResult> {
  await connectDB();

  const {
    farmerId,
    sourceType,
    sourceId,
    payload,
    preferredLanguage: explicitLang,
    requestedChannels,
    generateVoice = false,
    skipSuppression = false
  } = params;

  // 1. Fetch Farmer Preferences & Contact Info
  let user: IUser | null = null;
  try {
    user = await User.findOne({
      $or: [{ _id: farmerId.match(/^[0-9a-fA-F]{24}$/) ? farmerId : null }, { username: farmerId }]
    });
  } catch {
    // Non-fatal, use fallback defaults
  }

  // 2. Resolve Language (Farmer preference -> Application default -> hi-IN)
  const resolvedLang = resolveTtsLanguage(
    explicitLang || user?.preferredLanguage,
    user?.preferredLanguage
  ).language;

  // 3. Render Deterministic Advisory Narrative
  const localized = renderLocalizedAdvisory(payload, resolvedLang);

  // 4. Determine Active Channels based on Channel Policy
  const userChannels: DeliveryChannel[] = (user?.notificationChannels as DeliveryChannel[]) || ['FCM', 'WHATSAPP'];
  const targetChannels: DeliveryChannel[] = requestedChannels || userChannels;

  // Suppression Check for LOW / STABLE risks
  const isLowRisk = ['LOW', 'STABLE', 'NO_CONCERN'].includes(payload.riskLevel.toUpperCase());
  const effectiveChannels: DeliveryChannel[] = targetChannels.filter(ch => {
    if (isLowRisk && !skipSuppression) {
      // For low risk, only FCM/in-app is allowed by default policy
      return ch === 'FCM';
    }
    return true;
  });

  const channelsAttempted: DeliveryChannel[] = [];
  const channelsDelivered: DeliveryChannel[] = [];
  const deliveryDetails: Record<string, any> = {};
  const auditIds: string[] = [];

  // 5. Optional Voice Synthesis via VEXYL-TTS
  let audioAssetId: string | undefined = undefined;
  let audioUrl: string | undefined = undefined;

  const shouldGenerateVoice = generateVoice || effectiveChannels.includes('VOICE');
  if (shouldGenerateVoice) {
    channelsAttempted.push('VOICE');
    const voiceStyle: VoiceStyle = payload.riskLevel === 'HIGH' || payload.riskLevel === 'CRITICAL' ? 'URGENT' : 'CALM';
    
    const voiceRes = await generateAdvisoryVoice({
      text: localized.speechText,
      language: resolvedLang,
      style: voiceStyle,
      sourceNotificationId: sourceId
    });

    if (voiceRes.success && voiceRes.audioUrl) {
      audioUrl = voiceRes.audioUrl;
      audioAssetId = voiceRes.audioAssetId;
      channelsDelivered.push('VOICE');
      deliveryDetails['VOICE'] = { status: 'DELIVERED', providerMessageId: audioAssetId };

      const audit = await LocalizedNotification.create({
        farmerId,
        sourceType,
        sourceId,
        language: resolvedLang,
        channel: 'VOICE',
        title: localized.title,
        body: localized.speechText,
        audioAssetId,
        provider: 'vexyl_tts',
        providerMessageId: audioAssetId,
        deliveryStatus: 'DELIVERED',
        sentAt: new Date()
      });
      auditIds.push(audit._id.toString());
    } else {
      deliveryDetails['VOICE'] = { status: 'UNAVAILABLE', error: voiceRes.error };
      const audit = await LocalizedNotification.create({
        farmerId,
        sourceType,
        sourceId,
        language: resolvedLang,
        channel: 'VOICE',
        title: localized.title,
        body: localized.speechText,
        provider: 'vexyl_tts',
        deliveryStatus: 'UNAVAILABLE',
        failureReason: voiceRes.error || 'TTS service unavailable'
      });
      auditIds.push(audit._id.toString());
    }
  }

  // 6. FCM Dispatch
  if (effectiveChannels.includes('FCM')) {
    channelsAttempted.push('FCM');
    const fcmRes = await sendFcm({
      userId: farmerId,
      title: localized.title,
      body: localized.summary,
      data: {
        sourceType,
        sourceId,
        language: resolvedLang,
        riskLevel: payload.riskLevel,
        audioUrl: audioUrl || ''
      },
      advisoryId: sourceType === 'ADVISORY' ? sourceId : undefined
    });

    const status: LocalizedDeliveryStatus = fcmRes.success ? 'DELIVERED' : (fcmRes.reason?.includes('No active') ? 'SKIPPED' : 'FAILED');
    if (fcmRes.success) channelsDelivered.push('FCM');
    deliveryDetails['FCM'] = { status, error: fcmRes.reason };

    const audit = await LocalizedNotification.create({
      farmerId,
      sourceType,
      sourceId,
      language: resolvedLang,
      channel: 'FCM',
      title: localized.title,
      body: localized.summary,
      audioAssetId,
      provider: 'fcm',
      deliveryStatus: status,
      failureReason: fcmRes.reason,
      sentAt: fcmRes.success ? new Date() : null
    });
    auditIds.push(audit._id.toString());
  }

  // 7. WhatsApp Dispatch (Twilio Sandbox / Pre-approved Template)
  if (effectiveChannels.includes('WHATSAPP')) {
    channelsAttempted.push('WHATSAPP');
    const recipientPhone = user?.whatsappNumber || user?.mobile || process.env.TEST_WHATSAPP_TO;

    if (!recipientPhone) {
      deliveryDetails['WHATSAPP'] = { status: 'SKIPPED', error: 'No WhatsApp or mobile number found' };
      const audit = await LocalizedNotification.create({
        farmerId,
        sourceType,
        sourceId,
        language: resolvedLang,
        channel: 'WHATSAPP',
        title: localized.title,
        body: localized.whatsappText,
        provider: 'twilio_whatsapp',
        deliveryStatus: 'SKIPPED',
        failureReason: 'Missing recipient phone number'
      });
      auditIds.push(audit._id.toString());
    } else {
      let waRes;
      const isHighRisk = payload.riskLevel === 'HIGH' || payload.riskLevel === 'CRITICAL';
      const templateKey: WhatsAppTemplateKey = isHighRisk ? 'HIGH_RISK' : 'ACTION_REMINDER';
      const contentSid = getWhatsAppContentSid(templateKey, true);

      // Try template send first; fallback to direct message body
      waRes = await sendWhatsAppTemplate({
        to: recipientPhone,
        contentSid,
        variables: {
          '1': localized.cropLocalized,
          '2': localized.threatLocalized,
          '3': localized.actions[0] || 'Follow validated advisory'
        }
      });

      if (!waRes.success) {
        // Fallback to direct WhatsApp message text if template was rejected or unsupported
        waRes = await sendWhatsAppMessage({
          to: recipientPhone,
          body: localized.whatsappText,
          mediaUrl: audioUrl
        });
      }

      const waStatus: LocalizedDeliveryStatus = waRes.success ? 'SENT' : 'FAILED';
      if (waRes.success) channelsDelivered.push('WHATSAPP');
      deliveryDetails['WHATSAPP'] = {
        status: waStatus,
        providerMessageId: waRes.providerMessageId,
        error: waRes.error
      };

      const audit = await LocalizedNotification.create({
        farmerId,
        sourceType,
        sourceId,
        language: resolvedLang,
        channel: 'WHATSAPP',
        title: localized.title,
        body: localized.whatsappText,
        audioAssetId,
        templateId: contentSid,
        provider: 'twilio_whatsapp',
        providerMessageId: waRes.providerMessageId,
        deliveryStatus: waStatus,
        failureReason: waRes.error,
        sentAt: waRes.success ? new Date() : null
      });
      auditIds.push(audit._id.toString());
    }
  }

  // 8. SMS Dispatch (Feature-flagged behind SMS_ENABLED)
  if (effectiveChannels.includes('SMS')) {
    channelsAttempted.push('SMS');
    const recipientPhone = user?.smsNumber || user?.mobile;

    if (!isSmsEnabled()) {
      deliveryDetails['SMS'] = {
        status: 'SKIPPED',
        error: 'SMS_DISABLED_DLT_PENDING: India TRAI DLT registration required'
      };
      const audit = await LocalizedNotification.create({
        farmerId,
        sourceType,
        sourceId,
        language: resolvedLang,
        channel: 'SMS',
        title: localized.title,
        body: localized.smsText,
        provider: 'twilio_sms',
        deliveryStatus: 'SKIPPED',
        failureReason: 'SMS_DISABLED_DLT_PENDING'
      });
      auditIds.push(audit._id.toString());
    } else if (!recipientPhone) {
      deliveryDetails['SMS'] = { status: 'SKIPPED', error: 'No mobile number found' };
      const audit = await LocalizedNotification.create({
        farmerId,
        sourceType,
        sourceId,
        language: resolvedLang,
        channel: 'SMS',
        title: localized.title,
        body: localized.smsText,
        provider: 'twilio_sms',
        deliveryStatus: 'SKIPPED',
        failureReason: 'Missing recipient mobile'
      });
      auditIds.push(audit._id.toString());
    } else {
      const smsRes = await sendSms({
        to: recipientPhone,
        body: localized.smsText
      });

      const smsStatus: LocalizedDeliveryStatus = smsRes.success ? 'SENT' : (smsRes.status === 'skipped' ? 'SKIPPED' : 'FAILED');
      if (smsRes.success) channelsDelivered.push('SMS');
      deliveryDetails['SMS'] = {
        status: smsStatus,
        providerMessageId: smsRes.providerMessageId,
        error: smsRes.error
      };

      const audit = await LocalizedNotification.create({
        farmerId,
        sourceType,
        sourceId,
        language: resolvedLang,
        channel: 'SMS',
        title: localized.title,
        body: localized.smsText,
        provider: 'twilio_sms',
        providerMessageId: smsRes.providerMessageId,
        deliveryStatus: smsStatus,
        failureReason: smsRes.error,
        sentAt: smsRes.success ? new Date() : null
      });
      auditIds.push(audit._id.toString());
    }
  }

  return {
    success: true,
    farmerId,
    language: resolvedLang,
    localizedText: localized,
    channelsAttempted,
    channelsDelivered,
    audioUrl,
    audioAssetId,
    deliveryDetails: deliveryDetails as any,
    auditIds
  };
}
