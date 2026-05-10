const mongoose = require('mongoose');
require('dotenv').config();
const Activity = require('./models/Activity');

const sampleActivities = [
  {
    name: "Viphya Plateau Hike",
    location: "Viphya Plateau",
    region: "Northern Region",
    description: "Trek through the largest man-made forest in Africa.",
    pricePerDay: 23,      // Was 45,000 MK
    pricePerPerson: 13,   // Was 25,000 MK
    durationHours: 6,
    category: "hiking",
    difficulty: "moderate",
    images: [],
    mainImage: "",
    whatToBring: ["Hiking boots", "Water bottle", "Sun hat", "Camera"],
    meetingPoint: "Viphya Forest Entrance",
    minPeople: 2,
    maxPeople: 15
  },
  {
    name: "Livingstonia Cultural Heritage Tour",
    location: "Livingstonia",
    region: "Northern Region",
    description: "Visit the historic mission station.",
    pricePerDay: 18,      // Was 35,000 MK
    pricePerPerson: 10,   // Was 20,000 MK
    durationHours: 4,
    category: "cultural",
    difficulty: "easy",
    images: [],
    mainImage: "",
    whatToBring: ["Comfortable shoes", "Camera", "Water"],
    meetingPoint: "Livingstonia Mission Main Gate",
    minPeople: 1,
    maxPeople: 20
  },
  {
    name: "Lake Malawi Kayaking Adventure",
    location: "Cape Maclear",
    region: "Southern Region",
    description: "Kayak on the crystal clear waters of Lake Malawi.",
    pricePerDay: 28,      // Was 55,000 MK
    pricePerPerson: 15,   // Was 30,000 MK
    durationHours: 3,
    category: "kayaking",
    difficulty: "easy",
    images: [],
    mainImage: "",
    whatToBring: ["Swimsuit", "Sunscreen", "Towel"],
    meetingPoint: "Cape Maclear Waterfront",
    minPeople: 2,
    maxPeople: 10
  },
  {
    name: "Mulanje Mountain Trek",
    location: "Mulanje",
    region: "Southern Region",
    description: "Climb the highest peak in Central Africa.",
    pricePerDay: 33,      // Was 65,000 MK
    pricePerPerson: 18,   // Was 35,000 MK
    durationHours: 8,
    category: "hiking",
    difficulty: "challenging",
    images: [],
    mainImage: "",
    whatToBring: ["Hiking boots", "Warm clothes", "Water", "Snacks"],
    meetingPoint: "Likhubula Forest Office",
    minPeople: 2,
    maxPeople: 8
  },
  {
    name: "Liwonde National Park Safari",
    location: "Liwonde",
    region: "Southern Region",
    description: "Experience wildlife on a guided safari.",
    pricePerDay: 43,      // Was 85,000 MK
    pricePerPerson: 23,   // Was 45,000 MK
    durationHours: 5,
    category: "safari",
    difficulty: "easy",
    images: [],
    mainImage: "",
    whatToBring: ["Binoculars", "Camera", "Sunscreen", "Hat"],
    meetingPoint: "Liwonde Park Main Gate",
    minPeople: 2,
    maxPeople: 12
  },
  {
    name: "Likoma Island Boat Tour",
    location: "Likoma Island",
    region: "Eastern Region",
    description: "Visit the beautiful island in the middle of Lake Malawi.",
    pricePerDay: 38,      // Was 75,000 MK
    pricePerPerson: 20,   // Was 40,000 MK
    durationHours: 6,
    category: "beach",
    difficulty: "easy",
    images: [],
    mainImage: "",
    whatToBring: ["Swimsuit", "Sunscreen", "Towel", "Snorkel gear"],
    meetingPoint: "Nkhata Bay Ferry Dock",
    minPeople: 2,
    maxPeople: 15
  },
  {
    name: "Zomba Plateau Walking Tour",
    location: "Zomba",
    region: "Southern Region",
    description: "Walk through the beautiful plateau with unique vegetation.",
    pricePerDay: 20,      // Was 40,000 MK
    pricePerPerson: 11,   // Was 22,000 MK
    durationHours: 5,
    category: "hiking",
    difficulty: "moderate",
    images: [],
    mainImage: "",
    whatToBring: ["Hiking shoes", "Water", "Camera", "Jacket"],
    meetingPoint: "Zomba Plateau Entrance",
    minPeople: 1,
    maxPeople: 20
  },
  {
    name: "Ntchisi Forest Reserve Camping",
    location: "Ntchisi",
    region: "Central Region",
    description: "Camp in the pristine rainforest.",
    pricePerDay: 25,      // Was 50,000 MK
    pricePerPerson: 14,   // Was 28,000 MK
    durationHours: 24,
    category: "hiking",
    difficulty: "easy",
    images: [],
    mainImage: "",
    whatToBring: ["Tent", "Sleeping bag", "Food", "Water", "Flashlight"],
    meetingPoint: "Ntchisi Forest Lodge",
    minPeople: 2,
    maxPeople: 10
  },
  {
    name: "Chongoni Rock Art Tour",
    location: "Dedza",
    region: "Central Region",
    description: "Visit UNESCO World Heritage site with ancient rock paintings.",
    pricePerDay: 15,      // Was 30,000 MK
    pricePerPerson: 8,    // Was 15,000 MK
    durationHours: 3,
    category: "cultural",
    difficulty: "easy",
    images: [],
    mainImage: "",
    whatToBring: ["Camera", "Water", "Sunscreen"],
    meetingPoint: "Dedza Pottery Lodge",
    minPeople: 1,
    maxPeople: 15
  },
  {
    name: "Nyika National Park Wildlife Safari",
    location: "Nyika Plateau",
    region: "Northern Region",
    description: "Explore the unique high-altitude plateau with zebras and antelopes.",
    pricePerDay: 48,      // Was 95,000 MK
    pricePerPerson: 25,   // Was 50,000 MK
    durationHours: 8,
    category: "safari",
    difficulty: "moderate",
    images: [],
    mainImage: "",
    whatToBring: ["Warm clothes", "Binoculars", "Camera", "Sunscreen"],
    meetingPoint: "Nyika Park Entrance Gate",
    minPeople: 2,
    maxPeople: 12
  }
];

async function addActivities() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Activity.deleteMany({});
    await Activity.insertMany(sampleActivities);
    console.log("Sample activities added successfully with USD prices!");
    console.log("Prices range from USD 15 to USD 48 per day");
    process.exit();
  } catch (error) {
    console.error("Error:", error);
    process.exit();
  }
}

addActivities();