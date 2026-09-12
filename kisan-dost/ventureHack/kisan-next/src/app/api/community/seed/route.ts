import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import FarmerPost from '@/models/FarmerPost';
import CommunityComment from '@/models/CommunityComment';

export const dynamic = 'force-dynamic';

export const SEED_POSTS = [
  {
    authorName: 'Ramesh Patil',
    postType: 'Farmer Experience',
    crop: 'Cotton',
    cropStage: 'Flowering Stage',
    location: { state: 'Maharashtra', district: 'Yavatmal' },
    title: 'Managing severe Whitefly attack during flowering stage in Cotton',
    problem: 'Around 65 days after sowing, I noticed small white flies fluttering under the leaves and sticky honeydew secretion with black sooty mold starting to develop.',
    symptoms: [
      'Curling of upper tender leaves',
      'Sticky substance (honeydew) on upper leaf surface',
      'Black mold coating under sunlight',
      'Yellowing along the veins'
    ],
    whatIDid: 'Immediately installed yellow sticky traps (15 traps per acre) at canopy level. Spraying was done early morning with Neem oil 1500 ppm (5ml/L) followed after 4 days by Diafenthiuron 50% WP (1.2g/L) strictly targeting the lower leaf surfaces.',
    result: 'Whitefly adult population reduced by over 80% within 5 days. Sooty mold cleared up with subsequent rains, and normal boll setting resumed.',
    precautions: 'Do not spray synthetic pyrethroids which kill natural predators like ladybird beetles. Avoid excessive urea application during cloudy weather.',
    images: ['https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800&auto=format&fit=crop'],
    helpfulCount: 42,
    helpfulUsers: [],
    savedByUsers: [],
    commentCount: 3,
  },
  {
    authorName: 'Bharatbhai Patel',
    postType: 'Success Story',
    crop: 'Cotton',
    cropStage: 'Vegetative',
    location: { state: 'Gujarat', district: 'Rajkot' },
    title: 'Zero pink bollworm damage in 5 acres using pheromone traps and light traps',
    problem: 'In our Saurashtra region, Pink Bollworm has caused catastrophic losses in previous seasons, destroying bolls from the inside before farmers even notice.',
    symptoms: [
      'Rosette flowers in early phase',
      'Premature opening of bolls with stained lint'
    ],
    whatIDid: 'Installed 8 Pheromone traps per acre from 45 DAS with Pectino-lure. Changed lures every 25 days. Maintained one solar light trap in the field center.',
    result: 'Total infestation was below 2% compared to neighboring fields having 25-30% damage. Harvested 14 quintals per acre of grade-A clean cotton.',
    precautions: 'Ensure all neighboring farmers also install traps at the same time for area-wide community control. Timely lure replacement is critical.',
    images: ['https://images.unsplash.com/photo-1594771804886-a933bb2d609b?w=800&auto=format&fit=crop'],
    helpfulCount: 89,
    helpfulUsers: [],
    savedByUsers: [],
    commentCount: 5,
  },
  {
    authorName: 'Gurpreet Singh',
    postType: 'Prevention Tip',
    crop: 'Wheat',
    cropStage: 'Tillering',
    location: { state: 'Punjab', district: 'Ludhiana' },
    title: 'Yellow Rust early prevention checklist for PBW-725 and HD-2967 varieties',
    problem: 'Cool humid morning weather with dew triggers Stripe Rust (Puccinia striiformis) rapidly across Punjab fields during January-February.',
    symptoms: [
      'Yellow powder or pustules arranged in parallel stripes along leaf blades',
      'Powder stains fingers when touched'
    ],
    whatIDid: 'Started daily field scouting along field borders and shady corners where moisture lingers. As soon as first stripe was spotted, sprayed Propiconazole 25% EC (1ml/L) with flat fan nozzle in 200L water.',
    result: 'The disease was arrested completely at the border patch and did not spread to the rest of the 12-acre crop.',
    precautions: 'Do not wait for rust to cover full leaves. Spraying within 48 hours of first symptom is the difference between 5% and 50% yield loss.',
    images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop'],
    helpfulCount: 56,
    helpfulUsers: [],
    savedByUsers: [],
    commentCount: 2,
  },
  {
    authorName: 'Kishore Mali',
    postType: 'Crop Problem',
    crop: 'Tomato',
    cropStage: 'Fruiting',
    location: { state: 'Maharashtra', district: 'Nashik' },
    title: 'Sudden Early Blight concentric spots destroying fruit quality after unseasonal rains',
    problem: 'Following 3 days of unexpected rain with warm afternoon sun, lower tomato leaves developed target-board brown circular spots and fruit calyx began dropping.',
    symptoms: [
      'Dark brown concentric rings on older leaves (target-like pattern)',
      'Yellow chlorotic halos surrounding lesions',
      'Sunken brown spots on fruit stem ends'
    ],
    whatIDid: 'Pruned all bottom foliage up to 8 inches above soil to enhance aeration and prevent splash dispersal. Sprayed Mancozeb 75% WP (2.5g/L) followed by Azoxystrobin + Difenoconazole after 7 days.',
    result: 'New shoots and upper flower clusters were saved. Disease severity dropped significantly, saving approximately 70% of harvestable fruits.',
    precautions: 'Always stake tomato vines and use silver-black mulch to prevent soil pathogens from splashing onto lower leaves during irrigation.',
    images: ['https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=800&auto=format&fit=crop'],
    helpfulCount: 64,
    helpfulUsers: [],
    savedByUsers: [],
    commentCount: 4,
  },
  {
    authorName: 'Pravinbhai Vaghela',
    postType: 'Ask Farmers',
    crop: 'Onion',
    cropStage: 'Bulb Development',
    location: { state: 'Gujarat', district: 'Bhavnagar' },
    title: 'Purple blotch getting worse despite copper spray — any tested solutions from Saurashtra farmers?',
    problem: 'My Kharif onion crop is 70 days old. Leaves have purple water-soaked spots with dark centers. I sprayed Copper Oxychloride last week but new leaves are still showing brown sunken lesions.',
    symptoms: [
      'Elliptical purple spots on tubular leaves',
      'Leaves drying and breaking from midway'
    ],
    whatIDid: 'Tried Copper Oxychloride (3g/L) + sticker 5 days ago. Reduced furrow irrigation to dry topsoil.',
    result: 'Still spreading on roughly 30% of plants.',
    precautions: 'Seeking advice on whether systemic fungicide like Tebuconazole or biological control will work better at this stage.',
    images: ['https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop'],
    helpfulCount: 28,
    helpfulUsers: [],
    savedByUsers: [],
    commentCount: 6,
  },
  {
    authorName: 'Suresh Verma',
    postType: 'Success Story',
    crop: 'Soybean',
    cropStage: 'Pod Formation',
    location: { state: 'Madhya Pradesh', district: 'Ujjain' },
    title: 'Tackled Girdle Beetle and Semilooper without synthetic chemical burn',
    problem: 'During late August, observed ring-like cuts on soybean stems causing entire upper branches to wilt and die, accompanied by green caterpillars chewing leaves.',
    symptoms: [
      'Two parallel circular cuts/girdles on main stems',
      'Upper portion wilting and drooping',
      'Sieve-like defoliation by green loopers'
    ],
    whatIDid: 'Applied Chlorantraniliprole 18.5% SC (Coragen) at 60ml per acre using battery knapsack sprayer with hollow cone nozzle during calm late evening.',
    result: 'Caterpillar feeding halted within 12 hours. Stem cut damage stopped immediately. Pod development was healthy with 18.5 quintal/hectare harvest.',
    precautions: 'Do not delay treatment past the first sign of wilting tips. Spraying early morning or after 4 PM prevents rapid sunlight breakdown of active ingredients.',
    images: ['https://images.unsplash.com/photo-1599818814761-9c60e4be68b3?w=800&auto=format&fit=crop'],
    helpfulCount: 71,
    helpfulUsers: [],
    savedByUsers: [],
    commentCount: 3,
  },
  {
    authorName: 'Anita Yadav',
    postType: 'Prevention Tip',
    crop: 'Rice',
    cropStage: 'Vegetative',
    location: { state: 'Uttar Pradesh', district: 'Varanasi' },
    title: 'Preventing Bacterial Leaf Blight (BLB) after continuous standing water',
    problem: 'Excess rainfall and water stagnation created high humidity, leading to wavy water-soaked yellowish lesions from leaf tips downward.',
    symptoms: [
      'Water-soaked lesions starting from margins near leaf tips',
      'Lesions turn straw-yellow with wavy wavy margins',
      'Milky bacterial ooze beads in early morning dew'
    ],
    whatIDid: 'Drained standing water from paddy fields immediately. Cut off all top-dress nitrogen (urea). Sprayed Streptocycline (6g per 60L water) mixed with Copper Hydroxide (2g/L).',
    result: 'Arrested BLB progression within 48 hours. Fresh tillers emerged without infection once water was regulated.',
    precautions: 'Never apply urea when BLB is active; nitrogen accelerates bacterial multiplication tenfold. Ensure proper field drainage canals.',
    images: ['https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=800&auto=format&fit=crop'],
    helpfulCount: 53,
    helpfulUsers: [],
    savedByUsers: [],
    commentCount: 4,
  },
  {
    authorName: 'Rajesh Choudhary',
    postType: 'Farmer Experience',
    crop: 'Sugarcane',
    cropStage: 'Tillering',
    location: { state: 'Rajasthan', district: 'Kota' },
    title: 'Controlling Early Shoot Borer in Sugarcane with Trash Mulching and Trichogramma cards',
    problem: 'High summer temperatures (41°C) caused heavy shoot borer activity resulting in dry central whorls (dead hearts) emitting foul odor when pulled.',
    symptoms: [
      'Dead heart formation that pulls out easily and smells rotten at the base',
      'Pinholes near base of shoots'
    ],
    whatIDid: 'Spread dried cane trash mulch (3 inches thick) between rows to lower soil temperature and conserve moisture. Released Trichogramma chilonis egg parasitoid cards (20,000 eggs/acre) at 10-day intervals twice.',
    result: 'Dead heart incidence reduced from 22% down to less than 4%. Cane tillering vigorous and soil moisture retention doubled.',
    precautions: 'Avoid chemical spraying for 15 days after releasing beneficial Trichogramma parasitoids to give them time to multiply in the field.',
    images: ['https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&auto=format&fit=crop'],
    helpfulCount: 49,
    helpfulUsers: [],
    savedByUsers: [],
    commentCount: 2,
  },
  {
    authorName: 'Jagdishbhai Joshi',
    postType: 'Ask Farmers',
    crop: 'Potato',
    cropStage: 'Tuber Initiation',
    location: { state: 'Gujarat', district: 'Deesa' },
    title: 'Late Blight alerts in Banaskantha — What preventive schedule are you following?',
    problem: 'Foggy mornings and nighttime dew have been very heavy for the past 4 days. Temperatures around 12-15°C night and 26°C day. Worried about Late Blight outbreak in Kufri Pukhraj.',
    symptoms: [
      'Dense morning fog lasting till 9:30 AM',
      'Pale green water-soaked spots on leaf tips'
    ],
    whatIDid: 'Did one prophylactic spray of Cymoxanil 8% + Mancozeb 64% WP at 2.5g/L.',
    result: 'Leaves are clean currently but weather forecast indicates light drizzle next week.',
    precautions: 'Want to know if Dimethomorph or Metalaxyl should be kept ready as backup.',
    images: ['https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop'],
    helpfulCount: 37,
    helpfulUsers: [],
    savedByUsers: [],
    commentCount: 5,
  },
  {
    authorName: 'Vikram Rathore',
    postType: 'Farmer Experience',
    crop: 'Chilli',
    cropStage: 'Vegetative',
    location: { state: 'Madhya Pradesh', district: 'Khargone' },
    title: 'Managing Chilli Leaf Curl Virus and Thrips through Integrated Pest Management',
    problem: 'Upward leaf curling (boat shape) and stunted plant growth due to severe Thrips (Scirtothrips dorsalis) infestation.',
    symptoms: [
      'Upward curling of leaf margins',
      'Leaves brittle and canoe-shaped',
      'Brown silvery streaks on underside of leaves'
    ],
    whatIDid: 'Installed blue sticky traps (20/acre) for thrips and silver reflective mulch on beds. Sprayed Fipronil 5% SC (2ml/L) rotated with Spinetoram 11.7% SC (1ml/L) with 8 days gap.',
    result: 'Thrips count dropped dramatically. New shoots emerged straight, flat, and vibrant dark green with abundant flowering.',
    precautions: 'Always rotate insecticidal modes of action to prevent rapid resistance buildup in thrips. Blue sticky traps catch 3x more thrips than yellow ones.',
    images: ['https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=800&auto=format&fit=crop'],
    helpfulCount: 68,
    helpfulUsers: [],
    savedByUsers: [],
    commentCount: 7,
  },
  {
    authorName: 'Devendra Mahajan',
    postType: 'Prevention Tip',
    crop: 'Cotton',
    cropStage: 'Vegetative',
    location: { state: 'Maharashtra', district: 'Jalgaon' },
    title: 'Border cropping of Maize and Castor as trap crops around Cotton field',
    problem: 'Early season pest migrations of Spodoptera caterpillars and sucking pests from surrounding fallow lands.',
    symptoms: [
      'Pest entry from field perimeters'
    ],
    whatIDid: 'Planted 2 border rows of Maize and 1 row of Castor on all four sides of my 4-acre cotton plot 15 days before sowing cotton.',
    result: 'Castor attracted 85% of Spodoptera egg masses which were handpicked and destroyed easily. Maize served as windbreak and harbor for predatory spiders and ladybugs.',
    precautions: 'Inspect border trap crops every 3 days. If you dont destroy pests on the trap crop, it turns into a nursery for the pest.',
    images: ['https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&auto=format&fit=crop'],
    helpfulCount: 82,
    helpfulUsers: [],
    savedByUsers: [],
    commentCount: 4,
  },
  {
    authorName: 'Balwinder Dhillon',
    postType: 'Success Story',
    crop: 'Wheat',
    cropStage: 'Harvest',
    location: { state: 'Punjab', district: 'Bathinda' },
    title: 'Happy Seeder zero tillage wheat after paddy: saved ₹4,500/acre and zero stubble burning',
    problem: 'Paddy straw management before wheat sowing usually requires 4-5 tillage passes and burning, which dries soil and degrades microbiome.',
    symptoms: [
      'High operational tillage diesel costs and loss of organic matter'
    ],
    whatIDid: 'Used Super SMS equipped combine harvester for paddy, then sowed wheat directly into standing stubble using Happy Seeder with 45kg seed/acre.',
    result: 'Stubble acted as thick moisture mulch. Saved 1 full irrigation in December. Harvested 21.5 quintals/acre with improved grain test weight.',
    precautions: 'Proper uniform spreading of paddy straw during harvesting is essential for seed drill furrow clearance.',
    images: ['https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop'],
    helpfulCount: 95,
    helpfulUsers: [],
    savedByUsers: [],
    commentCount: 6,
  },
  {
    authorName: 'Manish Patel',
    postType: 'Crop Problem',
    crop: 'Groundnut',
    cropStage: 'Flowering',
    location: { state: 'Gujarat', district: 'Junagadh' },
    title: 'Tikka disease (leaf spot) spreading rapidly following 4 days of continuous overcast drizzle',
    problem: 'Black circular spots with bright yellow halos appeared on lower leaves of GG-20 groundnut crop. Premature defoliation has started in low-lying patches.',
    symptoms: [
      'Circular dark brown to black spots with distinct yellow halo',
      'Defoliation of lower canopy leaves',
      'Elongated dark lesions on stems and petioles'
    ],
    whatIDid: 'Tebucanozole 25.9% EC @ 1.25ml/L was sprayed immediately. Ensured spray reached underside of canopy.',
    result: 'Spreading halted within 3 days. New foliage is spot-free and peg formation is unaffected.',
    precautions: 'Avoid flood irrigation during cloudy humid weather. Apply prophylactic spray before monsoon closes.',
    images: ['https://images.unsplash.com/photo-1594771804886-a933bb2d609b?w=800&auto=format&fit=crop'],
    helpfulCount: 44,
    helpfulUsers: [],
    savedByUsers: [],
    commentCount: 2,
  },
  {
    authorName: 'Satish Shinde',
    postType: 'Farmer Experience',
    crop: 'Other',
    cropStage: 'Fruiting',
    location: { state: 'Maharashtra', district: 'Solapur' },
    title: 'Bacterial Blight (Telya) management in Bhagwa Pomegranate orchard',
    problem: 'Water-soaked oily dark lesions on fruits and stems after high velocity windy rains in September.',
    symptoms: [
      'Oily dark brown angular spots with cracks on fruit rind',
      'L-shaped or nodal black cankers on branches'
    ],
    whatIDid: 'Strictly pruned infected twigs and destroyed them away from orchard. Sprayed 1% Bordeaux mixture followed after 10 days by Streptocycline (0.5g/L) + Copper Oxychloride (2.5g/L).',
    result: 'Arrested further fruit cracking. 80% export-quality fruit harvest achieved without secondary fungal infection.',
    precautions: 'Sterilize secateurs with alcohol between pruning each tree. Apply copper paste on all cut ends immediately.',
    images: ['https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop'],
    helpfulCount: 61,
    helpfulUsers: [],
    savedByUsers: [],
    commentCount: 5,
  },
  {
    authorName: 'Harpreet Mann',
    postType: 'Ask Farmers',
    crop: 'Mustard',
    cropStage: 'Flowering',
    location: { state: 'Rajasthan', district: 'Alwar' },
    title: 'Mustard Aphid (Mahu) appearing in flower clusters — what works best without harming honeybees?',
    problem: 'Colonies of greenish-yellow aphids clustering on tender flowering twigs and pods, sucking sap and curling pods.',
    symptoms: [
      'Aphid clusters choking central flowering axis',
      'Sooty mold on lower leaves from aphid honeydew'
    ],
    whatIDid: 'Handpicked infested terminal shoots from border rows. Considering Dimethoate or Verticillium lecanii bio-fungicide.',
    result: 'Looking for farmer feedback on bee-safe timing.',
    precautions: 'Want to ensure spraying is done post 4:30 PM when honeybee foraging activity ceases.',
    images: ['https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop'],
    helpfulCount: 39,
    helpfulUsers: [],
    savedByUsers: [],
    commentCount: 4,
  },
  {
    authorName: 'Sunil Gaikwad',
    postType: 'Success Story',
    crop: 'Onion',
    cropStage: 'Bulb Development',
    location: { state: 'Maharashtra', district: 'Ahmednagar' },
    title: 'Drip fertigation with Potassium Schoenite increased onion bulb grade size by 22%',
    problem: 'Traditional broadcast muriate of potash caused uneven bulb sizing and higher split bulb percentage.',
    symptoms: [
      'Uneven bulb sizing in flood irrigated plots'
    ],
    whatIDid: 'Switched to drip irrigation. Gave Potassium Schoenite (0:0:23 + 11% Mg) in two splits at 55 and 70 days after transplanting @ 15kg/acre.',
    result: 'Produced 92% uniform grade-A bulbs with deep red luster and excellent storage shelf-life of 5 months.',
    precautions: 'Stop all nitrogen 25 days before harvest to avoid neck rot during storage.',
    images: ['https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop'],
    helpfulCount: 78,
    helpfulUsers: [],
    savedByUsers: [],
    commentCount: 5,
  },
  {
    authorName: 'Mahesh Yadav',
    postType: 'Prevention Tip',
    crop: 'Potato',
    cropStage: 'Vegetative',
    location: { state: 'Uttar Pradesh', district: 'Agra' },
    title: 'Timely ridge earthing-up completely prevents greening and Potato Tuber Moth (PTM)',
    problem: 'Exposed developing tubers turning green and bitter from direct sun exposure, and potato tuber moth entering soil cracks.',
    symptoms: [
      'Green skin on shallow tubers containing toxic solanine',
      'Moth caterpillars boring into uncovered tubers'
    ],
    whatIDid: 'Performed thorough earthing up (mounding) at 30-35 DAS when plants were 15-20cm tall, ensuring a broad 20cm high ridge.',
    result: 'Zero green tuber rejection at cold storage grading. Clean white-flesh potato harvest.',
    precautions: 'Do not damage root zone during second earthing-up. Maintain optimal moisture to prevent soil cracking.',
    images: ['https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop'],
    helpfulCount: 58,
    helpfulUsers: [],
    savedByUsers: [],
    commentCount: 3,
  },
  {
    authorName: 'Anil Chaudhary',
    postType: 'Crop Problem',
    crop: 'Chilli',
    cropStage: 'Flowering',
    location: { state: 'Andhra Pradesh', district: 'Guntur' },
    title: 'Invasive Black Thrips (Thrips parvispinus) causing heavy blossom drop in Teja variety',
    problem: 'Tiny black insects inside flowers feeding on ovaries, causing complete flower abortion and no fruit setting.',
    symptoms: [
      'Stamens turning black and drying inside flowers',
      'Flowers dropping prematurely before fruit sets',
      'Downward leaf curling and scarred young fruit'
    ],
    whatIDid: 'Installed 40 blue sticky sheets per acre. Sprayed Spinosad 45% SC @ 0.3ml/L followed 5 days later by Flonicamid 50% WG @ 0.4g/L.',
    result: 'Flower drop reduced by 75% within a week and healthy fruit set began.',
    precautions: 'Do not use organophosphates repeatedly as it leads to flare-up. Keep field free from weed hosts like Parthenium.',
    images: ['https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=800&auto=format&fit=crop'],
    helpfulCount: 67,
    helpfulUsers: [],
    savedByUsers: [],
    commentCount: 6,
  },
  {
    authorName: 'Navdeep Gill',
    postType: 'Farmer Experience',
    crop: 'Rice',
    cropStage: 'Tillering',
    location: { state: 'Haryana', district: 'Karnal' },
    title: 'Yellow Stem Borer dead heart control in Basmati PB-1121',
    problem: 'During active tillering, central tillers started yellowing, drying up into dead hearts that pull out effortlessly.',
    symptoms: [
      'Dead hearts during vegetative stage',
      'Egg masses covered with buff-colored hairs on upper leaf tips'
    ],
    whatIDid: 'Clipping of seedling leaf tips before transplanting destroyed 80% egg masses. In standing crop, applied Cartap Hydrochloride 4G granules @ 7.5kg/acre with thin layer of standing water.',
    result: 'Borer caterpillars killed inside stems. Vigorous tillering resumed with zero dead hearts.',
    precautions: 'Do not allow fields to dry out for 4 days after granular application to maintain systemic absorption.',
    images: ['https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=800&auto=format&fit=crop'],
    helpfulCount: 52,
    helpfulUsers: [],
    savedByUsers: [],
    commentCount: 2,
  },
  {
    authorName: 'Raju Kurmi',
    postType: 'Ask Farmers',
    crop: 'Soybean',
    cropStage: 'Pod Formation',
    location: { state: 'Madhya Pradesh', district: 'Dewas' },
    title: 'Yellow Mosaic Virus (YMV) spreading rapidly through whiteflies in JS-9560 — should I harvest early?',
    problem: 'Patches of alternating green and bright yellow mosaic pattern on leaves. Pods in affected plants are small and empty.',
    symptoms: [
      'Bright yellow patches on leaf lamina',
      'Stunted plants with few underdeveloped pods'
    ],
    whatIDid: 'Rouged out and buried initial infected plants. Sprayed Thiamethoxam 25% WG @ 80g/acre to stop vector whiteflies.',
    result: 'Seeking opinions from Malwa farmers whether foliar potassium spray helps grain filling now.',
    precautions: 'Next season I will switch to YMV-resistant varieties like NRC-37 or JS-20-34.',
    images: ['https://images.unsplash.com/photo-1599818814761-9c60e4be68b3?w=800&auto=format&fit=crop'],
    helpfulCount: 46,
    helpfulUsers: [],
    savedByUsers: [],
    commentCount: 4,
  }
];

export async function POST(req: Request) {
  try {
    await dbConnect();

    // Check if posts already exist
    const count = await FarmerPost.countDocuments();
    if (count >= 20) {
      return NextResponse.json({
        message: `Database already populated with ${count} farmer posts`,
        count,
      });
    }

    // Insert posts
    const createdPosts = await FarmerPost.insertMany(SEED_POSTS);

    // Insert sample comments for the first few posts
    if (createdPosts.length > 0) {
      const sampleComments = [
        {
          postId: createdPosts[0]._id,
          authorName: 'Kailash Patel',
          authorLocation: 'Amravati, MH',
          content: 'Very accurate! Diafenthiuron also worked wonders in my farm. Mixing with neem oil gives longer residual protection.',
          helpfulCount: 8,
        },
        {
          postId: createdPosts[0]._id,
          authorName: 'Vijay Deshmukh',
          authorLocation: 'Wardha, MH',
          content: 'Did you observe any phytotoxicity on tender leaves when sprayed at 1.2g/L? I found 1g/L safer during high heat.',
          helpfulCount: 5,
        },
        {
          postId: createdPosts[1]._id,
          authorName: 'Manish Ahir',
          authorLocation: 'Junagadh, GJ',
          content: 'Pheromone traps are truly a game changer. Which brand of lure did you find most long-lasting?',
          helpfulCount: 11,
        },
        {
          postId: createdPosts[3]._id,
          authorName: 'Nitin Kadam',
          authorLocation: 'Pune, MH',
          content: 'Bottom leaf pruning is crucial for tomato. It cuts humidity inside canopy and stops alternating spore dispersion completely.',
          helpfulCount: 7,
        },
        {
          postId: createdPosts[4]._id,
          authorName: 'Hardik Sorathiya',
          authorLocation: 'Bhavnagar, GJ',
          content: 'Tebuconazole 25.9% EC @ 1.5ml/L gives guaranteed control over purple blotch within 3 days. Stop copper for now.',
          helpfulCount: 14,
        }
      ];

      await CommunityComment.insertMany(sampleComments);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${createdPosts.length} realistic farmer network posts and sample comments!`,
      count: createdPosts.length,
    });
  } catch (error: any) {
    console.error('Seed API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return POST({} as Request);
}
