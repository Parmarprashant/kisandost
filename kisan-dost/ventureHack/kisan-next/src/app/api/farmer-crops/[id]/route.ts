import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { FarmerCrop } from '@/models/FarmerCrop';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Missing crop ID' }, { status: 400 });
    }

    await connectDB();

    // Find and delete the crop, ensuring it belongs to the user
    const deletedCrop = await FarmerCrop.findOneAndDelete({
      _id: id,
      farmerId: userId,
    });

    if (!deletedCrop) {
      return NextResponse.json(
        { error: 'Crop not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Crop deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting crop:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
