import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

import connectDB from '../src/lib/mongodb';
import { ingestInstitutionalDiscovery } from '../src/lib/expert/institutionIngestionService';
import { AgriInstitutionReference } from '../src/models/AgriInstitutionReference';
import { ExpertProfile } from '../src/models/ExpertProfile';

async function runPhase9Ingestion() {
  console.log('================================================================');
  console.log('🏛️  AGRISHIELD 360° / PHASE 9 — INSTITUTIONAL DISCOVERY INGESTION');
  console.log('================================================================\n');

  await connectDB();

  // Safely drop stale multikey index if it was created on Atlas
  try {
    const coll = ExpertProfile.collection;
    const indexes = await coll.indexes();
    if (indexes.some((idx: any) => idx.name === 'states_1_districts_1')) {
      await coll.dropIndex('states_1_districts_1');
      console.log('Dropped legacy states_1_districts_1 index.');
    }
  } catch (err: any) {
    // collection may not exist yet, ignore
  }

  console.log('Ingesting institutional references from KVK.txt & ICAR Directory...');
  const result = await ingestInstitutionalDiscovery();

  console.log(`\n✅ Ingestion Complete:`);
  console.log(`   - KVK Institutions Ingested: ${result.kvkCount} (Gujarat & Maharashtra)`);
  console.log(`   - ICAR Central Institutes: ${result.icarInstituteCount}`);
  console.log(`   - Total Institutional References: ${result.totalInstitutions}`);
  console.log(`   - Candidate Expert Profiles Available: ${result.seededCandidateExperts}`);

  // Provenance verification check
  const mehsanaKvk = await AgriInstitutionReference.findOne({ district: 'Mehsana' });
  console.log(`\n📍 Provenance Verification Sample:`);
  console.log(`   Name: ${mehsanaKvk?.name}`);
  console.log(`   District: ${mehsanaKvk?.district}, State: ${mehsanaKvk?.state}`);
  console.log(`   Source Location: ${mehsanaKvk?.sourceLocation}`);
  console.log(`   Host Organization: ${mehsanaKvk?.hostOrganization}`);

  const verifiedProfile = await ExpertProfile.findOne({ verificationStatus: 'VERIFIED' });
  console.log(`\n👨‍🔬 Verified Expert Sample:`);
  console.log(`   Name: ${verifiedProfile?.fullName}`);
  console.log(`   Institution: ${verifiedProfile?.institutionName}`);
  console.log(`   Status: ${verifiedProfile?.verificationStatus} (Verified by: ${verifiedProfile?.verifiedBy})`);
  console.log(`   Specialization: ${verifiedProfile?.specialization.join(', ')}`);

  console.log('\n================================================================');
  console.log('🏁 PHASE 9 INSTITUTIONAL INGESTION COMPLETED SUCCESSFULLY');
  console.log('================================================================');
  process.exit(0);
}

runPhase9Ingestion().catch((err) => {
  console.error('Fatal ingestion error:', err);
  process.exit(1);
});
