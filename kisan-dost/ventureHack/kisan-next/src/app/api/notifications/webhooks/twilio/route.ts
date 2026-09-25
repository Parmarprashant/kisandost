import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { LocalizedNotification, LocalizedDeliveryStatus } from '@/models/LocalizedNotification';

/**
 * Twilio Status Callback Webhook.
 * Receives delivery events (sent, delivered, undelivered, failed) and updates audit records.
 */
export async function POST(req: Request) {
  try {
    let formData: FormData | null = null;
    let messageSid = '';
    let messageStatus = '';
    let errorCode = '';
    let errorMessage = '';

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      formData = await req.formData();
      messageSid = (formData.get('MessageSid') as string) || '';
      messageStatus = (formData.get('MessageStatus') as string) || '';
      errorCode = (formData.get('ErrorCode') as string) || '';
      errorMessage = (formData.get('ErrorMessage') as string) || '';
    } else {
      const json = await req.json().catch(() => ({}));
      messageSid = json.MessageSid || json.messageSid || '';
      messageStatus = json.MessageStatus || json.messageStatus || '';
      errorCode = json.ErrorCode || json.errorCode || '';
      errorMessage = json.ErrorMessage || json.errorMessage || '';
    }

    if (!messageSid) {
      return NextResponse.json({ error: 'Missing MessageSid' }, { status: 400 });
    }

    await connectDB();

    // Map Twilio status to internal LocalizedDeliveryStatus
    let mappedStatus: LocalizedDeliveryStatus = 'SENT';
    if (['delivered', 'read'].includes(messageStatus.toLowerCase())) {
      mappedStatus = 'DELIVERED';
    } else if (['failed', 'undelivered'].includes(messageStatus.toLowerCase())) {
      mappedStatus = 'FAILED';
    } else if (['queued', 'sending', 'sent'].includes(messageStatus.toLowerCase())) {
      mappedStatus = 'SENT';
    }

    const updateFields: any = {
      deliveryStatus: mappedStatus
    };
    if (errorMessage || errorCode) {
      updateFields.failureReason = `Twilio error ${errorCode}: ${errorMessage}`;
    }

    const updated = await LocalizedNotification.findOneAndUpdate(
      { providerMessageId: messageSid },
      { $set: updateFields },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      messageSid,
      mappedStatus,
      matchedRecord: !!updated
    });
  } catch (err: any) {
    console.error('[TwilioWebhook] Error handling webhook:', err.message);
    return NextResponse.json({ error: err.message || 'Webhook processing failed' }, { status: 500 });
  }
}
