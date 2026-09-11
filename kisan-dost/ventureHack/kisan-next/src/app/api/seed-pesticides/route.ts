import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { PesticideDatabase } from '@/models/PesticideDatabase';

export async function GET() {
  try {
    await connectDB();

    const pesticides = [
      {
        productName: 'Imidacloprid 17.8% SL',
        brandName: 'Confidor',
        manufacturer: 'Bayer Crop Science',
        licenseNumber: 'LIC-AG-98432',
        qrCodeId: 'IMD178SL001',
        pesticideType: 'Insecticide',
        dosagePerAcre: '40 ml per acre',
        usageInstructions: 'Spray during vegetative stage for Aphid and Whitefly control. Mix in 200L water per acre.',
        isAuthentic: true,
      },
      {
        productName: 'Chlorpyrifos 20% EC',
        brandName: 'Dursban',
        manufacturer: 'Dow AgroSciences',
        licenseNumber: 'LIC-AG-23115',
        qrCodeId: 'CHL20EC002',
        pesticideType: 'Insecticide',
        dosagePerAcre: '500 ml per acre',
        usageInstructions: 'Spray during early infestation stage. Effective against soil pests and stem borers.',
        isAuthentic: true,
      },
      {
        productName: 'Mancozeb 75% WP',
        brandName: 'Dithane M-45',
        manufacturer: 'UPL Limited',
        licenseNumber: 'LIC-AG-44201',
        qrCodeId: 'MAN75WP003',
        pesticideType: 'Fungicide',
        dosagePerAcre: '600 g per acre',
        usageInstructions: 'Spray on foliage to control late blight, downy mildew, and anthracnose.',
        isAuthentic: true,
      },
      {
        productName: 'Cypermethrin 10% EC',
        brandName: 'SuperKill',
        manufacturer: 'Unknown',
        licenseNumber: 'INVALID-FAKE',
        qrCodeId: 'FAKE999XXX',
        pesticideType: 'Insecticide',
        dosagePerAcre: 'Unknown',
        usageInstructions: 'COUNTERFEIT PRODUCT - do not use.',
        isAuthentic: false,
      },
    ];

    // Clear existing seed data to avoid duplicates
    await PesticideDatabase.deleteMany({ qrCodeId: { $in: pesticides.map(p => p.qrCodeId) } });
    await PesticideDatabase.insertMany(pesticides);

    return NextResponse.json({
      message: `Seeded ${pesticides.length} pesticides (3 genuine + 1 fake).`,
      qrCodeIds: pesticides.map(p => ({ name: p.productName, id: p.qrCodeId, authentic: p.isAuthentic })),
    });
  } catch (error: any) {
    console.error('Pesticide seeding failed:', error);
    return NextResponse.json({ error: 'Seeding failed' }, { status: 500 });
  }
}
