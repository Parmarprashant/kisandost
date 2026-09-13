import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { CropMaster } from '@/models/CropMaster';

const DEFAULT_CROPS = [
  {
    cropName: 'Cotton',
    varieties: ['Bt Cotton', 'Desi Cotton', 'H-4', 'RCH 2', 'Bunny', 'Other'],
  },
  {
    cropName: 'Wheat',
    varieties: ['HD 2967', 'PBW 343', 'DBW 187', 'GW 322', 'Lok 1', 'Other'],
  },
  {
    cropName: 'Rice',
    varieties: ['Basmati 1121', 'Pusa 44', 'IR 64', 'Swarna', 'Jaya', 'Other'],
  },
  {
    cropName: 'Groundnut',
    varieties: ['TAG 24', 'GG 20', 'TG 37A', 'JL 24', 'Kadiri 6', 'Other'],
  },
  {
    cropName: 'Maize',
    varieties: ['HQPM 1', 'Bio 9681', 'COH M 6', 'DHM 117', 'Other'],
  },
  {
    cropName: 'Soybean',
    varieties: ['JS 335', 'JS 9560', 'NRC 37', 'MACS 1407', 'Other'],
  },
  {
    cropName: 'Tomato',
    varieties: ['Arka Rakshak', 'Pusa Ruby', 'Pusa Early Dwarf', 'Heem Sohna', 'Other'],
  },
  {
    cropName: 'Potato',
    varieties: ['Kufri Jyoti', 'Kufri Pukhraj', 'Kufri Bahar', 'Kufri Lauvkar', 'Other'],
  },
  {
    cropName: 'Onion',
    varieties: ['Agrifound Dark Red', 'N-53', 'Bhima Super', 'Pusa Red', 'Other'],
  },
  {
    cropName: 'Sugarcane',
    varieties: ['Co 0238', 'Co 86032', 'Co 0118', 'Co 6304', 'Other'],
  },
  {
    cropName: 'Mango',
    varieties: ['Alphonso', 'Kesar', 'Dasheri', 'Langra', 'Totapuri', 'Other'],
  },
];

export async function GET() {
  try {
    await connectDB();

    let crops = await CropMaster.find({ active: true }).sort({ cropName: 1 });

    if (crops.length === 0) {
      // Auto-seed default crop master list
      crops = await CropMaster.insertMany(DEFAULT_CROPS);
    }

    return NextResponse.json(crops, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching CropMaster:', error);
    // Fallback to static array in case database connection fails
    return NextResponse.json(DEFAULT_CROPS, { status: 200 });
  }
}
