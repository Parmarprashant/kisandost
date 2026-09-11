import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { PesticideDatabase } from '@/models/PesticideDatabase';
import { ScanHistory } from '@/models/ScanHistory';
import { checkMembership } from '@/lib/checkMembership';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only premium members can use the scanner
    const hasMembership = await checkMembership(userId);
    if (!hasMembership) {
      return NextResponse.json({ error: 'Premium membership required' }, { status: 403 });
    }

    const { qrCodeId } = await req.json();

    if (!qrCodeId) {
      return NextResponse.json({ error: 'qrCodeId is required' }, { status: 400 });
    }

    await connectDB();

    // Look up the pesticide in the verified database
    const pesticide = await PesticideDatabase.findOne({ qrCodeId });

    let result: 'genuine' | 'fake' | 'notfound';
    let responseData: any;

    if (!pesticide) {
      result = 'notfound';
      responseData = {
        verified: false,
        warning: '⚠️ This pesticide is not found in the official registry. Do NOT use it — it may be counterfeit.',
      };
    } else if (!pesticide.isAuthentic) {
      result = 'fake';
      responseData = {
        verified: false,
        warning: '⚠️ WARNING: This product has been flagged as counterfeit. Do NOT use it.',
        product: pesticide,
      };
    } else {
      result = 'genuine';
      responseData = {
        verified: true,
        product: pesticide,
      };
    }

    // Log the scan to ScanHistory
    await ScanHistory.create({
      userId,
      qrCodeId,
      productName: pesticide?.productName || null,
      result,
    });

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error('Pesticide verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
