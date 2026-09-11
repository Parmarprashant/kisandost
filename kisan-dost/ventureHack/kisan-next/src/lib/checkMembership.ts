import connectDB from '@/lib/mongodb';
import { UserMembership } from '@/models/UserMembership';

/**
 * Server-side utility to check if a user has an active premium membership.
 */
export async function checkMembership(userId: string): Promise<boolean> {
  if (!userId) return false;
  
  await connectDB();
  
  const now = new Date();
  const membership = await UserMembership.findOne({
    userId,
    status: 'active',
    planType: 'premium',
    endDate: { $gte: now },
  });
  
  return !!membership;
}
