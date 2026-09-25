import { NextResponse } from 'next/server';
import { auth, currentUser } from '@/lib/auth';
import { uploadAdditionalEvidence } from '@/lib/expert/expertTicketService';
import { saveScanImage } from '@/lib/imageStorage';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authData = await auth();
    if (!authData.userId) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get('image') as File | null;
    const farmerNotes = (formData.get('notes') as string) || '';
    const directImageUrl = (formData.get('imageUrl') as string) || '';

    let finalImageUrl = directImageUrl;

    if (file && file.size > 0) {
      const stored = await saveScanImage(file);
      finalImageUrl = stored.url;
    }

    if (!finalImageUrl) {
      return NextResponse.json({ error: 'No image provided for additional evidence' }, { status: 400 });
    }

    const ticket = await uploadAdditionalEvidence({
      ticketId: id,
      farmerId: user._id.toString(),
      additionalImageUrl: finalImageUrl,
      farmerNotes,
    });

    return NextResponse.json({
      success: true,
      message: 'Additional evidence uploaded successfully. Ticket is back in review.',
      ticket,
    });
  } catch (error: any) {
    console.error('[API-Expert-UploadEvidence-PATCH] Error:', error);
    const status = error.message.includes('Forbidden') ? 403 : error.message.includes('not found') ? 404 : 400;
    return NextResponse.json({ error: error.message }, { status });
  }
}
