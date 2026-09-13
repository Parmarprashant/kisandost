/**
 * lib/twoFactor.ts
 * Backend service wrapper for 2Factor SMS gateway integration.
 * Supports both Transactional TSMS API and Registered Template API routes.
 */

export interface TwoFactorResult {
  success: boolean;
  message: string;
  providerMessageId?: string;
  responseRaw?: string;
  error?: string;
}

/**
 * Mask phone number for production logging compliance
 * E.g., "9512628557" => "******8557"
 */
function maskPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 4) return '******';
  return '*'.repeat(digits.length - 4) + digits.slice(-4);
}

export async function sendTwoFactorSms(
  phoneNumber: string,
  messageText: string
): Promise<TwoFactorResult> {
  const apiKey = process.env.TWOFACTOR_API_KEY;
  const senderId = process.env.TWOFACTOR_SENDER_ID || '2FACTOR';
  const templateName = process.env.TWOFACTOR_TEMPLATE_NAME;

  // 1. Validate API Key Presence
  if (!apiKey || apiKey === 'YOUR_2FACTOR_API_KEY') {
    const errorMsg = 'TWOFACTOR_API_KEY is missing or unconfigured in backend environment variables (.env).';
    console.error('❌ [2Factor] Request failed:', errorMsg);
    return {
      success: false,
      message: 'SMS request failed',
      error: errorMsg,
    };
  }

  // 2. Validate Recipient Phone Number (10-digit Indian mobile format)
  const cleanedPhone = phoneNumber.replace(/\D/g, '').slice(-10);
  if (!cleanedPhone || cleanedPhone.length !== 10) {
    const errorMsg = 'Invalid recipient phone number. Expected a 10-digit mobile number.';
    console.error(`❌ [2Factor] Validation error for recipient "${maskPhoneNumber(phoneNumber)}"`);
    return {
      success: false,
      message: 'SMS request failed',
      error: errorMsg,
    };
  }

  const maskedPhone = maskPhoneNumber(cleanedPhone);
  const tsmsEndpoint = `https://2factor.in/API/V1/${apiKey}/ADDON_SERVICES/SEND/TSMS`;
  const sanitizedEndpointLog = `https://2factor.in/API/V1/[REDACTED_API_KEY]/ADDON_SERVICES/SEND/TSMS`;

  // 3. Safe Backend Logging
  console.log('---------------------------------------------------------');
  console.log(`📱 SMS provider: 2Factor`);
  console.log(`   Endpoint: ${sanitizedEndpointLog}`);
  console.log(`   Recipient: ${maskedPhone}`);
  console.log(`   Sender ID: ${senderId}`);
  if (templateName) console.log(`   Template Name: ${templateName}`);
  console.log(`   Message length: ${messageText.length} characters`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    // Step A: Attempt 2Factor Transactional TSMS API
    const formData = new URLSearchParams({
      From: senderId,
      To: cleanedPhone,
      Msg: messageText,
    });
    if (templateName) {
      formData.append('TemplateName', templateName);
      formData.append('VAR1', messageText);
    }

    const response = await fetch(tsmsEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'KisanDost-2Factor-Client/1.0',
      },
      body: formData.toString(),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const rawText = await response.text();
    let jsonRes: any = {};
    try {
      jsonRes = JSON.parse(rawText);
    } catch {
      jsonRes = { Status: 'Unknown', Details: rawText };
    }

    const providerStatus = jsonRes.Status || (response.ok ? 'Success' : 'Error');
    const providerDetails = jsonRes.Details || rawText;

    console.log(`   HTTP status: ${response.status}`);
    console.log(`   Provider status: ${providerStatus}`);
    console.log(`   Provider response: ${JSON.stringify({ Status: providerStatus, Details: providerDetails })}`);

    if (response.ok && providerStatus === 'Success') {
      console.log(`✅ [2Factor] SMS request accepted via TSMS API! SessionId: ${providerDetails}`);
      console.log('---------------------------------------------------------');
      return {
        success: true,
        message: 'Test SMS request accepted',
        providerMessageId: String(providerDetails),
        responseRaw: rawText,
      };
    }

    // Step B: Fallback to Registered Template API if TSMS returned template mismatch error & TemplateName is set
    if (
      templateName &&
      typeof providerDetails === 'string' &&
      (providerDetails.includes('Incorrect sender id') || providerDetails.includes('TemplateName'))
    ) {
      console.log(`ℹ️ [2Factor] Falling back to Registered Template API for template "${templateName}"...`);

      const fallbackUrl = `https://2factor.in/API/V1/${apiKey}/SMS/${cleanedPhone}/AUTOGEN/${encodeURIComponent(templateName)}`;
      const fallbackController = new AbortController();
      const fallbackTimeout = setTimeout(() => fallbackController.abort(), 20000);

      const fallbackRes = await fetch(fallbackUrl, { signal: fallbackController.signal });
      clearTimeout(fallbackTimeout);

      const fallbackText = await fallbackRes.text();
      let fallbackJson: any = {};
      try {
        fallbackJson = JSON.parse(fallbackText);
      } catch {
        fallbackJson = { Status: 'Unknown', Details: fallbackText };
      }

      console.log(`   Fallback HTTP status: ${fallbackRes.status}`);
      console.log(`   Fallback Provider status: ${fallbackJson.Status}`);
      console.log(`   Fallback Provider response: ${JSON.stringify(fallbackJson)}`);

      if (fallbackRes.ok && fallbackJson.Status === 'Success') {
        console.log(`✅ [2Factor] SMS request accepted via Registered Template API! SessionId: ${fallbackJson.Details}`);
        console.log('---------------------------------------------------------');
        return {
          success: true,
          message: 'Test SMS request accepted',
          providerMessageId: String(fallbackJson.Details),
          responseRaw: fallbackText,
        };
      }
    }

    // Handle Failure
    const failureMsg = `2Factor SMS gateway error: ${providerDetails}`;
    console.error(`❌ [2Factor] ${failureMsg}`);
    console.log('---------------------------------------------------------');
    return {
      success: false,
      message: 'SMS request failed',
      error: failureMsg,
      responseRaw: rawText,
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      const timeoutMsg = 'Connection to 2Factor API timed out after 20 seconds. Please check your network connection.';
      console.error('❌ [2Factor] Timeout Exception:', timeoutMsg);
      console.log('---------------------------------------------------------');
      return {
        success: false,
        message: 'SMS request failed',
        error: timeoutMsg,
      };
    }

    const networkMsg = `Network error reaching 2Factor server: ${error.message}`;
    console.error('❌ [2Factor] Exception:', networkMsg);
    console.log('---------------------------------------------------------');
    return {
      success: false,
      message: 'SMS request failed',
      error: networkMsg,
    };
  }
}
