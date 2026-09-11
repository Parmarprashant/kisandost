import { differenceInDays } from 'date-fns';
import { CropAdvisory } from '@/models/CropAdvisory';

/**
 * Calculates the number of days since the crop was planted.
 */
export function calculateDaysAfterSowing(plantationDate: Date): number {
  return differenceInDays(new Date(), new Date(plantationDate));
}

/**
 * Finds the appropriate advisory for a crop based on its age.
 */
export async function getActiveAdvisory(cropType: string, daysAfterSowing: number) {
  return await CropAdvisory.findOne({
    cropType: cropType.toLowerCase(),
    daysAfterSowingStart: { $lte: daysAfterSowing },
    daysAfterSowingEnd: { $gte: daysAfterSowing }
  });
}
