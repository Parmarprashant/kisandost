/**
 * whatsappTemplates.ts
 * ============================================================================
 * WhatsApp Template Registry for KisanDost Phase 10.
 * Supports Twilio Sandbox pre-approved templates for development and
 * configured custom Content SIDs for production.
 * ============================================================================
 */

export type WhatsAppTemplateKey =
  | 'HIGH_RISK'
  | 'EXPERT_VERIFIED'
  | 'ACTION_REMINDER'
  | 'REVIEW_COMPLETED'
  | 'EVIDENCE_REQUIRED';

export interface WhatsAppTemplateConfig {
  key: WhatsAppTemplateKey;
  contentSid: string;
  sandboxFallbackSid: string;
  variableKeys: string[];
  formatVariables: (data: {
    crop: string;
    threat: string;
    riskLevel?: string;
    action?: string;
    farmerName?: string;
    date?: string;
  }) => Record<string, string>;
}

export const WHATSAPP_TEMPLATES: Record<WhatsAppTemplateKey, WhatsAppTemplateConfig> = {
  HIGH_RISK: {
    key: 'HIGH_RISK',
    // Production Content SID from env or default
    contentSid: process.env.TWILIO_CONTENT_SID_HIGH_RISK || 'HX_high_risk_advisory_sid',
    // Twilio pre-approved sandbox template Content SID
    sandboxFallbackSid: 'HXb95625a48730bfacdd37e01f7b0373c3',
    variableKeys: ['1', '2', '3'],
    formatVariables: data => ({
      '1': data.crop || 'Crop',
      '2': data.threat || 'Threat',
      '3': data.action || 'Follow validated advisory'
    })
  },

  EXPERT_VERIFIED: {
    key: 'EXPERT_VERIFIED',
    contentSid: process.env.TWILIO_CONTENT_SID_EXPERT_VERIFIED || 'HX_expert_verified_sid',
    sandboxFallbackSid: 'HXb95625a48730bfacdd37e01f7b0373c3',
    variableKeys: ['1', '2', '3'],
    formatVariables: data => ({
      '1': data.farmerName || 'Farmer',
      '2': `${data.crop} - ${data.threat}`,
      '3': 'Expert Verified'
    })
  },

  ACTION_REMINDER: {
    key: 'ACTION_REMINDER',
    contentSid: process.env.TWILIO_CONTENT_SID_ACTION_REMINDER || 'HX_action_reminder_sid',
    sandboxFallbackSid: 'HXb95625a48730bfacdd37e01f7b0373c3',
    variableKeys: ['1', '2'],
    formatVariables: data => ({
      '1': data.crop || 'Field',
      '2': data.date || 'Today'
    })
  },

  REVIEW_COMPLETED: {
    key: 'REVIEW_COMPLETED',
    contentSid: process.env.TWILIO_CONTENT_SID_REVIEW_COMPLETED || 'HX_review_completed_sid',
    sandboxFallbackSid: 'HXb95625a48730bfacdd37e01f7b0373c3',
    variableKeys: ['1', '2'],
    formatVariables: data => ({
      '1': data.crop || 'Crop',
      '2': 'Review Completed'
    })
  },

  EVIDENCE_REQUIRED: {
    key: 'EVIDENCE_REQUIRED',
    contentSid: process.env.TWILIO_CONTENT_SID_EVIDENCE_REQUIRED || 'HX_evidence_required_sid',
    sandboxFallbackSid: 'HXb95625a48730bfacdd37e01f7b0373c3',
    variableKeys: ['1', '2'],
    formatVariables: data => ({
      '1': data.crop || 'Crop',
      '2': 'Additional Photo Required'
    })
  }
};

/**
 * Returns the effective contentSid for a template key.
 */
export function getWhatsAppContentSid(key: WhatsAppTemplateKey, isSandbox = true): string {
  const tpl = WHATSAPP_TEMPLATES[key];
  if (!tpl) {
    return WHATSAPP_TEMPLATES.HIGH_RISK.contentSid;
  }
  return isSandbox ? tpl.sandboxFallbackSid : tpl.contentSid;
}
