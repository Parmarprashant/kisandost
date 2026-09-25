/**
 * smsProvider.ts
 * ============================================================================
 * Twilio SMS Messaging Provider for KisanDost Phase 10.
 * Kept strictly behind feature flag (SMS_ENABLED=false) until India TRAI / DLT
 * (Distributed Ledger Technology) Entity and Template Registration is fulfilled.
 * ============================================================================
 */

export interface SendSmsParams {
  to: string;
  body: string;
  senderId?: string;
}

export interface SmsDeliveryResult {
  success: boolean;
  providerMessageId?: string;
  status: 'queued' | 'sent' | 'delivered' | 'skipped' | 'failed' | 'simulated';
  error?: string;
  dltCompliant?: boolean;
}

/**
 * Checks whether domestic SMS dispatch is enabled in environment.
 */
export function isSmsEnabled(): boolean {
  return process.env.SMS_ENABLED === 'true';
}

/**
 * Normalizes phone number into international E.164 format (+91...).
 */
export function formatSmsRecipient(phone: string): string {
  let clean = phone.trim().replace(/[\s\-()]/g, '');
  if (!clean.startsWith('+')) {
    if (clean.length === 10) {
      clean = `+91${clean}`;
    } else if (clean.startsWith('91') && clean.length === 12) {
      clean = `+${clean}`;
    } else {
      clean = `+${clean}`;
    }
  }
  return clean;
}

/**
 * Sends an SMS via Twilio Messaging API if enabled by feature flag.
 * If SMS_ENABLED=false, gracefully skips delivery and logs DLT requirement.
 */
export async function sendSms(params: SendSmsParams): Promise<SmsDeliveryResult> {
  if (!isSmsEnabled()) {
    console.info('[SmsProvider] SMS delivery skipped: SMS_ENABLED=false (India TRAI DLT registration pending)');
    return {
      success: false,
      status: 'skipped',
      error: 'SMS_DISABLED_DLT_PENDING: India domestic SMS requires TRAI DLT/Sender ID registration before production dispatch.',
      dltCompliant: false
    };
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = params.senderId || process.env.TWILIO_SMS_FROM || '+14155238886';

  if (!accountSid || !authToken || accountSid.includes('dummy') || accountSid.includes('development')) {
    console.warn('[SmsProvider] Live Twilio credentials not configured; simulating SMS dispatch.');
    return {
      success: true,
      providerMessageId: `SM_simulated_sms_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      status: 'simulated',
      dltCompliant: false
    };
  }

  const to = formatSmsRecipient(params.to);

  try {
    const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const formData = new URLSearchParams();
    formData.append('From', fromNumber);
    formData.append('To', to);
    formData.append('Body', params.body);

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
      const errMsg = data.message || `Twilio SMS HTTP ${res.status}`;
      console.error(`[SmsProvider] Delivery failed: ${errMsg}`);
      return {
        success: false,
        error: errMsg,
        status: 'failed'
      };
    }

    return {
      success: true,
      providerMessageId: data.sid,
      status: (data.status as any) || 'queued',
      dltCompliant: true
    };
  } catch (err: any) {
    console.error('[SmsProvider] Exception during SMS send:', err.message);
    return {
      success: false,
      error: err.message || 'SMS network request failed',
      status: 'failed'
    };
  }
}
