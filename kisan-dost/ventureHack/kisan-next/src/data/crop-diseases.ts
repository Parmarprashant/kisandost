export type Category = "fruits" | "vegetables" | "cereals" | "cashCrops";

export interface Disease {
  id: string;
  name: string;
  description: string;
  symptoms: string[];
  favorableConditions: string;
  impact: string;
  prevention: string[];
}

export interface Crop {
  id: string;
  name: string;
  category: Category;
  image: string;
  diseases: Disease[];
}

export const CROP_DATA: Crop[] = [
  // CEREALS
  {
    id: "wheat",
    name: "Wheat",
    category: "cereals",
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=400&auto=format&fit=crop",
    diseases: [
      {
        id: "wheat-rust",
        name: "Wheat Rust",
        description: "Fungal disease affecting wheat stems, leaves, and grains.",
        symptoms: ["Rust-colored pustules", "Yellowing of leaves", "Stunted growth"],
        favorableConditions: "Warm days and cool nights with dew.",
        impact: "Reduces yield by 20-50%.",
        prevention: ["Resistant varieties", "Fungicides", "Timely planting"]
      }
    ]
  },
  {
    id: "rice",
    name: "Rice",
    category: "cereals",
    image: "https://images.unsplash.com/photo-1536633100521-2e212450531c?q=80&w=400&auto=format&fit=crop",
    diseases: [
      {
        id: "rice-blast",
        name: "Rice Blast",
        description: "Fungal infection affecting above-ground parts.",
        symptoms: ["Diamond-shaped spots", "Neck rot"],
        favorableConditions: "High humidity and continuous rain.",
        impact: "Severe destruction of the entire crop.",
        prevention: ["Resistant varieties", "Balanced nitrogen", "Proper spacing"]
      }
    ]
  },
  {
    id: "corn",
    name: "Corn",
    category: "cereals",
    image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?q=80&w=400&auto=format&fit=crop",
    diseases: [
      {
        id: "corn-smut",
        name: "Common Smut",
        description: "Fungal disease causing galls on plants.",
        symptoms: ["White/black galls", "Distorted ears"],
        favorableConditions: "Hot, dry weather followed by rain.",
        impact: "Reduces yield and grain quality.",
        prevention: ["Rotation", "Avoid injury", "Seed treatment"]
      }
    ]
  },

  // FRUITS
  {
    id: "banana",
    name: "Banana",
    category: "fruits",
    image: "https://images.unsplash.com/photo-1528825871115-3581a5387919?q=80&w=400&auto=format&fit=crop",
    diseases: [
      {
        id: "panama-disease",
        name: "Panama Disease",
        description: "Soil-borne fungal disease.",
        symptoms: ["Yellow leaf margins", "Wilting", "Split pseudostem"],
        favorableConditions: "Acidic soil and poor drainage.",
        impact: "Permanent loss of plantations.",
        prevention: ["Clean planting material", "Resistant varieties"]
      }
    ]
  },
  {
    id: "grapes",
    name: "Grapes",
    category: "fruits",
    image: "https://images.unsplash.com/photo-1533604195953-9366a2e92da2?q=80&w=400&auto=format&fit=crop",
    diseases: [
      {
        id: "downy-mildew-grapes",
        name: "Downy Mildew",
        description: "Aggressive fungal disease of vines.",
        symptoms: ["Oil spots", "White mold underside"],
        favorableConditions: "Wet weather, moderate temps.",
        impact: "Severe defoliation and fruit loss.",
        prevention: ["Canopy management", "Copper sprays"]
      }
    ]
  },
  {
    id: "pineapple",
    name: "Pineapple",
    category: "fruits",
    image: "https://images.unsplash.com/photo-1550258114-b834e70d9be8?q=80&w=400&auto=format&fit=crop",
    diseases: [
      {
        id: "heart-rot",
        name: "Heart Rot",
        description: "Fungal decay of the inner leaves.",
        symptoms: ["Yellowing center", "Leaves pull out easily"],
        favorableConditions: "Waterlogged heavy soils.",
        impact: "Plant death.",
        prevention: ["Drainage", "Fungicide dip"]
      }
    ]
  },
  {
    id: "orange",
    name: "Orange",
    category: "fruits",
    image: "https://images.unsplash.com/photo-1582281298055-e25b84a30b44?q=80&w=400&auto=format&fit=crop",
    diseases: [
      {
        id: "citrus-canker",
        name: "Citrus Canker",
        description: "Bacterial spots on fruit and leaves.",
        symptoms: ["Raised brown lesions", "Yellow halos"],
        favorableConditions: "Wind-driven rain.",
        impact: "Reduces yield and quality.",
        prevention: ["Certification", "Copper sprays"]
      }
    ]
  },
  {
    id: "pomegranate",
    name: "Pomegranate",
    category: "fruits",
    image: "https://images.unsplash.com/photo-1614741300962-d261e4798670?q=80&w=400&auto=format&fit=crop",
    diseases: [
      {
        id: "bacterial-blight-pom",
        name: "Bacterial Blight",
        description: "Dark water-soaked lesions.",
        symptoms: ["Spots on fruits", "Fruit cracking"],
        favorableConditions: "Rainy weather.",
        impact: "Severe market loss.",
        prevention: ["Pruning", "Antibiotics"]
      }
    ]
  },
  {
    id: "plum",
    name: "Plum",
    category: "fruits",
    image: "https://images.unsplash.com/photo-1541859453959-442433219f74?q=80&w=400&auto=format&fit=crop",
    diseases: [
      {
        id: "black-knot",
        name: "Black Knot",
        description: "Fungal swellings on branches.",
        symptoms: ["Warty black galls", "Dieback"],
        favorableConditions: "Wet springs.",
        impact: "Can kill the tree.",
        prevention: ["Pruning knots", "Destroy infections"]
      }
    ]
  },
  {
    id: "pear",
    name: "Pear",
    category: "fruits",
    image: "https://images.unsplash.com/photo-1628114002636-6950275816fd?q=80&w=400&auto=format&fit=crop",
    diseases: [
      {
        id: "fire-blight-pear",
        name: "Fire Blight",
        description: "Bacterial scorching disease.",
        symptoms: ["Blackened twigs", "Oozing cankers"],
        favorableConditions: "Warm, wet blooms.",
        impact: "Rapid tree death.",
        prevention: ["Sanitary pruning", "Bactericides"]
      }
    ]
  },
  {
    id: "peach",
    name: "Peach",
    category: "fruits",
    image: "https://images.unsplash.com/photo-1629012411984-7a9117cf6002?q=80&w=400&auto=format&fit=crop",
    diseases: [
      {
        id: "leaf-curl-peach",
        name: "Peach Leaf Curl",
        description: "Fungal distortion of leaves.",
        symptoms: ["Puckered reddish leaves", "Premature drop"],
        favorableConditions: "Cool, wet spring.",
        impact: "Weakens tree vitality.",
        prevention: ["Copper sprays in dormancy"]
      }
    ]
  },
  {
    id: "strawberry",
    name: "Strawberry",
    category: "fruits",
    image: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?q=80&w=400&auto=format&fit=crop",
    diseases: [
      {
        id: "gray-mold-strawberry",
        name: "Gray Mold",
        description: "Common berry fungus.",
        symptoms: ["Fuzzy gray mold", "Soft rot"],
        favorableConditions: "High humidity.",
        impact: "Post-harvest decay.",
        prevention: ["Mulching", "Airflow", "Early picking"]
      }
    ]
  },
  {
    id: "papaya",
    name: "Papaya",
    category: "fruits",
    image: "https://images.unsplash.com/photo-1517282001574-f304bb374b17?q=80&w=400&auto=format&fit=crop",
    diseases: [
      {
        id: "ringspot-papaya",
        name: "Papaya Ringspot",
        description: "Viral rings on fruit leaves.",
        symptoms: ["Rings on fruit", "Reduced leaf size"],
        favorableConditions: "Aphid activity.",
        impact: "Stunts plant growth.",
        prevention: ["Resistant seeds", "Vector control"]
      }
    ]
  },
  {
    id: "watermelon",
    name: "Watermelon",
    category: "fruits",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=400&auto=format&fit=crop",
    diseases: [
      {
        id: "fusarium-wilt-wm",
        name: "Fusarium Wilt",
        description: "Soil-borne pathogen.",
        symptoms: ["Wilting vines", "Stem browning"],
        favorableConditions: "Warm soil.",
        impact: "Total crop failure.",
        prevention: ["Crop rotation", "Grafting"]
      }
    ]
  },
  {
    id: "apple",
    name: "Apple",
    category: "fruits",
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6bcd6?q=80&w=400&auto=format&fit=crop",
    diseases: [
      {
        id: "apple-scab",
        name: "Apple Scab",
        description: "Velvety spots on fruit.",
        symptoms: ["Scabby fruit lesions", "Leaf drop"],
        favorableConditions: "Rainy spring.",
        impact: "Market loss.",
        prevention: ["Resistant varieties", "Scheduled sprays"]
      }
    ]
  },

  // VEGETABLES
  {
    id: "soyabean",
    name: "Soyabean",
    category: "vegetables",
    image: "https://images.unsplash.com/photo-1594911775351-4122d1746654?q=80&w=400&auto=format&fit=crop",
    diseases: [
      {
        id: "soybean-rust",
        name: "Soybean Rust",
        description: "Aggressive foliar fungus.",
        symptoms: ["Tan leaf spots", "Early defoliation"],
        favorableConditions: "High moisture.",
        impact: "Up to 80% loss.",
        prevention: ["Early monitoring", "Fungicides"]
      }
    ]
  },
  {
    id: "carrot",
    name: "Carrot",
    category: "vegetables",
    image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=400&auto=format&fit=crop",
    diseases: [
      {
        id: "carrot-leaf-blight",
        name: "Alternaria Blight",
        description: "Common carrot leaf rot.",
        symptoms: ["Dark spots", "Yellow edges"],
        favorableConditions: "Humid heat.",
        impact: "Reduces root size.",
        prevention: ["Seed treatment", "Rotation"]
      }
    ]
  },
  {
    id: "pepper",
    name: "Pepper",
    category: "vegetables",
    image: "https://images.unsplash.com/photo-1514733331410-847829f27361?q=80&w=400&auto=format&fit=crop",
    diseases: [
      {
        id: "bacterial-spot-pepper",
        name: "Bacterial Spot",
        description: "Damaging bacterial infection.",
        symptoms: ["Foliar spots", "Fruit cankers"],
        favorableConditions: "Rain and heat.",
        impact: "Sunscald and yield drop.",
        prevention: ["Pathogen-free seed", "Copper sprays"]
      }
    ]
  },
  {
    id: "potato",
    name: "Potato",
    category: "vegetables",
    image: "https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?q=80&w=400&auto=format&fit=crop",
    diseases: [
      {
        id: "late-blight-potato",
        name: "Late Blight",
        description: "Destructive fungal rot.",
        symptoms: ["Dark leaf lesions", "Tuber rot"],
        favorableConditions: "Moist cool weather.",
        impact: "Total plant loss.",
        prevention: ["Certified seed", "Protective hilling"]
      }
    ]
  },
  {
    id: "broccoli",
    name: "Broccoli",
    category: "vegetables",
    image: "https://images.unsplash.com/photo-1453904300235-0f2f60b15b5d?q=80&w=400&auto=format&fit=crop",
    diseases: [
      {
        id: "clubroot-broccoli",
        name: "Clubroot",
        description: "Soil-borne root distortion.",
        symptoms: ["Swollen roots", "Stunting"],
        favorableConditions: "Acidic soil moisture.",
        impact: "Small heads, plant death.",
        prevention: ["Soil pH management"]
      }
    ]
  },
  {
    id: "cucumber",
    name: "Cucumber",
    category: "vegetables",
    image: "https://images.unsplash.com/photo-1449339854873-750e6df51597?q=80&w=400&auto=format&fit=crop",
    diseases: [
      {
        id: "powdery-mildew-cuc",
        name: "Powdery Mildew",
        description: "White leaf powder fungus.",
        symptoms: ["White powder", "Leaf drying"],
        favorableConditions: "Humidity.",
        impact: "Reduced harvest life.",
        prevention: ["Resistant varieties", "Sulfur"]
      }
    ]
  },
  {
    id: "lettuce",
    name: "Lettuce",
    category: "vegetables",
    image: "https://images.unsplash.com/photo-1464454709131-ffd692591ee5?q=80&w=400&auto=format&fit=crop",
    diseases: [
      {
        id: "downy-mildew-lettuce",
        name: "Downy Mildew",
        description: "Leaf rot of lettuce.",
        symptoms: ["Yellow angular spots", "White mold"],
        favorableConditions: "Cool and wet.",
        impact: "Destroys marketable heads.",
        prevention: ["Rotation", "Evening dry-out"]
      }
    ]
  },
  {
    id: "spinach",
    name: "Spinach",
    category: "vegetables",
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=400&auto=format&fit=crop",
    diseases: [
      {
        id: "spinach-downy-mildew",
        name: "Downy Mildew",
        description: "Critical spinach rot.",
        symptoms: ["Yellow patches", "Moldy underside"],
        favorableConditions: "Damp cold weather.",
        impact: "Rapid crop destruction.",
        prevention: ["Resistant hybrids", "Spacing"]
      }
    ]
  },
  {
    id: "cauliflower",
    name: "Cauliflower",
    category: "vegetables",
    image: "https://images.unsplash.com/photo-1510627498534-cf7e9002facc?q=80&w=400&auto=format&fit=crop",
    diseases: [
      {
        id: "black-rot-cauli",
        name: "Black Rot",
        description: "Crucifer bacterial decay.",
        symptoms: ["V-shaped yellow margin", "Black veins"],
        favorableConditions: "Warm Rain.",
        impact: "Severe head rot.",
        prevention: ["Clean seed", "Rotation"]
      }
    ]
  },
  {
    id: "cabbage",
    name: "Cabbage",
    category: "vegetables",
    image: "https://images.unsplash.com/photo-1550142254-7f2824da66bc?q=80&w=400&auto=format&fit=crop",
    diseases: [
      {
        id: "alternaria-leaf-spot-cab",
        name: "Alternaria Spot",
        description: "Unsightly head fungus.",
        symptoms: ["Zonate spots", "Browning"],
        favorableConditions: "Hot and humid.",
        impact: "Decreases shelf-life and value.",
        prevention: ["Drip irrigation", "Sanitation"]
      }
    ]
  },
  {
    id: "onion",
    name: "Onion",
    category: "vegetables",
    image: "https://images.unsplash.com/photo-1541336032412-2048a6785301?q=80&w=400&auto=format&fit=crop",
    diseases: [
      {
        id: "purple-blotch-onion",
        name: "Purple Blotch",
        description: "Bulb-stunting fungus.",
        symptoms: ["Purple spots", "Leaf dry out"],
        favorableConditions: "Humidity.",
        impact: "Affects quality and storage.",
        prevention: ["Long rotation", "Drainage"]
      }
    ]
  },
  {
    id: "tomato",
    name: "Tomato",
    category: "vegetables",
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=400&auto=format&fit=crop",
    diseases: [
      {
        id: "early-blight-tom",
        name: "Early Blight",
        description: "Common foliar rot.",
        symptoms: ["Concentric leaf circles", "Fruit rot"],
        favorableConditions: "Humid days.",
        impact: "Reduces yield by damaging foliage.",
        prevention: ["Mulching", "Pruning lower leaves"]
      }
    ]
  },

  // CASH CROPS
  {
    id: "cotton",
    name: "Cotton",
    category: "cashCrops",
    image: "https://images.unsplash.com/photo-1558384737-0f35f73b9903?q=80&w=400&auto=format&fit=crop",
    diseases: [
      {
        id: "boll-rot-cotton",
        name: "Boll Rot",
        description: "Cotton boll decay.",
        symptoms: ["Water-soaked boll spots", "Discoloration"],
        favorableConditions: "Rain and density.",
        impact: "Reduces lint yield and quality.",
        prevention: ["Drainage", "Insects control"]
      }
    ]
  },
  {
    id: "sugarcane",
    name: "Sugarcane",
    category: "cashCrops",
    image: "https://images.unsplash.com/photo-1605333396515-01822e17d65e?q=80&w=400&auto=format&fit=crop",
    diseases: [
      {
        id: "red-rot-sugarcane",
        name: "Red Rot",
        description: "Critical sugar rot.",
        symptoms: ["Red stalk interior", "Alcoholic smell"],
        favorableConditions: "Rain and waterlogging.",
        impact: "Reduces sugar recovery and weight.",
        prevention: ["Clean seed", "Red rot resistance"]
      }
    ]
  }
];
