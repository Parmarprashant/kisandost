/**
 * whatsappProvider.ts
 * ============================================================================
 * Twilio WhatsApp Messaging Provider for KisanDost Phase 10.
 * Supports Twilio Sandbox and production approved templates via REST API.
 * Strict non-fatal degradation: messaging failure NEVER fails advisory creation.
 * ============================================================================
 */

export interface SendWhatsAppTemplateParams {
  to: string;
  contentSid: string;
  variables?: Record<string, string>;
}

export interface SendWhatsAppMessageParams {
  to: string;
  body: string;
  mediaUrl?: string;
}

export interface WhatsAppDeliveryResult {
  success: boolean;
  providerMessageId?: string;
  status?: 'queued' | 'sent' | 'delivered' | 'failed' | 'simulated';
  error?: string;
}

/**
 * Normalizes phone number into international E.164 WhatsApp format.
 * Defaults to India (+91) if 10-digit mobile number is provided.
 */
export function formatWhatsAppRecipient(phone: string): string {
  let clean = phone.trim().replace(/[\s\-()]/g, '');
  if (clean.startsWith('whatsapp:')) {
    clean = clean.replace('whatsapp:', '');
  }
  if (!clean.startsWith('+')) {
    if (clean.length === 10) {
      clean = `+91${clean}`;
    } else if (clean.startsWith('91') && clean.length === 12) {
      clean = `+${clean}`;
    } else {
      clean = `+${clean}`;
    }
  }
  return `whatsapp:${clean}`;
}

/**
 * Sends a WhatsApp templated message using Twilio Messages API.
 */
export async function sendWhatsAppTemplate(
  params: SendWhatsAppTemplateParams
): Promise<WhatsAppDeliveryResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

  if (!accountSid || !authToken || accountSid.includes('dummy') || accountSid.includes('development')) {
    // Development simulation mode when live credentials are not set
    console.warn('[WhatsAppProvider] Live Twilio credentials not configured; simulating template dispatch.');
    return {
      success: true,
      providerMessageId: `SM_simulated_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      status: 'simulated'
    };
  }

  const to = formatWhatsAppRecipient(params.to);

  try {
    const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const formData = new URLSearchParams();
    formData.append('From', fromNumber);
    formData.append('To', to);
    formData.append('ContentSid', params.contentSid);
    if (params.variables && Object.keys(params.variables).length > 0) {
      formData.append('ContentVariables', JSON.stringify(params.variables));
    }

    const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    const data = await res.json();

    if (!res.ok) {
      const errMsg = data.message || `Twilio HTTP ${res.status}`;
      console.error(`[WhatsAppProvider] Delivery failed (${data.code}): ${errMsg}`);
      return {
        success: false,
        error: errMsg,
        status: 'failed'
      };
    }

    return {
      success: true,
      providerMessageId: data.sid,
      status: data.status || 'queued'
    };
  } catch (err: any) {
    console.error('[WhatsAppProvider] Network exception during send:', err.message);
    return {
      success: false,
      error: err.message || 'Twilio network request failed',
      status: 'failed'
    };
  }
}

/**
 * Sends a direct WhatsApp message (for active session windows or Sandbox text dispatch).
 */
export async function sendWhatsAppMessage(
  params: SendWhatsAppMessageParams
): Promise<WhatsAppDeliveryResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

  if (!accountSid || !authToken || accountSid.includes('dummy') || accountSid.includes('development')) {
    console.warn('[WhatsAppProvider] Live Twilio credentials not configured; simulating direct message.');
    return {
      success: true,
      providerMessageId: `SM_simulated_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      status: 'simulated'
    };
  }

  const to = formatWhatsAppRecipient(params.to);

  try {
    const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const formData = new URLSearchParams();
    formData.append('From', fromNumber);
    formData.append('To', to);
    formData.append('Body', params.body);
    if (params.mediaUrl) {
      formData.append('MediaUrl', params.mediaUrl);
    }

    const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    const data = await res.json();

    if (!res.ok) {
      const errMsg = data.message || `Twilio HTTP ${res.status}`;
      return {
        success: false,
        error: errMsg,
        status: 'failed'
      };
    }

    return {
      success: true,
      providerMessageId: data.sid,
      status: data.status || 'queued'
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Twilio request failed',
      status: 'failed'
    };
  }
}
