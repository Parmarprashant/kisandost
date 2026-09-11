/**
 * lib/sendSMS.ts
 * Fast2SMS provider wrapper for KisanDost.
 */

export async function sendSMS(phoneNumber: string, message: string, retries = 3): Promise<{ success: boolean; error?: string }> {
  console.log(`[SMS Attempt] Sending SMS to ${phoneNumber}: "${message}"`);

  // Ensure environment variables are loaded
  const apiKey = process.env.FAST2SMS_API_KEY;

  if (!apiKey) {
    console.warn("⚠️ FAST2SMS_API_KEY missing in environment variables. Simulating success instead.");
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { success: true };
  }

  const url = new URL("https://www.fast2sms.com/dev/bulkV2");
  url.searchParams.append("authorization", apiKey);
  url.searchParams.append("route", "q");
  url.searchParams.append("message", message);
  url.searchParams.append("numbers", phoneNumber);
  url.searchParams.append("language", "english");
  url.searchParams.append("flash", "0");

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url.toString(), {
        method: "GET",
      });

      const data = await response.json();

      if (data.return) {
        console.log(`✅ SMS successfully dispatched to ${phoneNumber} via Fast2SMS.`);
        return { success: true };
      } else {
        console.error(`❌ Fast2SMS send failed (Attempt ${i + 1}):`, data.message);
        if (i === retries - 1) return { success: false, error: data.message };
      }
    } catch (error: any) {
      console.error(`❌ Fast2SMS exception (Attempt ${i + 1}):`, error);
      if (i === retries - 1) return { success: false, error: error.message };
    }
    // Exponential backoff before retry
    await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
  }

  return { success: false, error: "Failed after max retries" };
}
