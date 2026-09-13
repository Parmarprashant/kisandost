import { NextResponse } from 'next/server';
import { sendTwoFactorSms } from '@/lib/twoFactor';

export async function POST() {
  try {
    const testPhone = process.env.TEST_FARMER_PHONE;
    const apiKey = process.env.TWOFACTOR_API_KEY;

    // 1. Validate API Key Presence
    if (!apiKey || apiKey === 'YOUR_2FACTOR_API_KEY') {
      return NextResponse.json(
        {
          success: false,
          message: 'SMS request failed',
          error:
            'TWOFACTOR_API_KEY is not configured in backend environment variables (.env). Please add your 2Factor API key to .env.',
        },
        { status: 400 }
      );
    }

    // 2. Validate Recipient Phone Number Presence
    if (!testPhone) {
      return NextResponse.json(
        {
          success: false,
          message: 'SMS request failed',
          error:
            'TEST_FARMER_PHONE is not configured in backend environment variables (.env). Please set recipient phone number in .env.',
        },
        { status: 400 }
      );
    }

    // 3. Predefined Test Message (Step 5)
    const testMessage =
      'KisanDost test SMS: Your SMS notification system is working successfully.';

    const maskedPhone =
      testPhone.length > 4
        ? '*'.repeat(testPhone.length - 4) + testPhone.slice(-4)
        : '******';

    console.log(`[API /api/sms/test] Dispatching 2Factor SMS test to recipient ${maskedPhone}...`);

    const result = await sendTwoFactorSms(testPhone, testMessage);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message || 'SMS request failed',
          error: result.error || '2Factor SMS gateway rejected the request.',
          responseRaw: result.responseRaw,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: result.message || 'Test SMS request accepted',
        providerMessageId: result.providerMessageId,
        recipient: maskedPhone,
        responseRaw: result.responseRaw,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ [API /api/sms/test] Exception:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'SMS request failed',
        error: `Server exception: ${error.message}`,
      },
      { status: 500 }
    );
  }
}


