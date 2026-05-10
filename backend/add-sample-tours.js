const mongoose = require('mongoose');
require('dotenv').config();
const Tour = require('./models/Tour');

const sampleTours = [
  {
    name: "Rome Ancient Wonders",
    destination: "Italy",
    durationDays: 3,
    price: 299,
    maxCapacity: 20,
    startDate: new Date("2026-06-01"),
    endDate: new Date("2026-10-31"),
    itineraryText: "Day 1: Colosseum & Roman Forum. Day 2: Vatican City. Day 3: Trevi Fountain.",
    included: "Guide, skip-the-line tickets, 2 lunches",
    notIncluded: "Hotel, flights, tips",
    status: "published"
  },
  {
    name: "Paris Explorer",
    destination: "France",
    durationDays: 4,
    price: 399,
    maxCapacity: 15,
    startDate: new Date("2026-06-01"),
    endDate: new Date("2026-10-31"),
    itineraryText: "Day 1: Eiffel Tower. Day 2: Louvre. Day 3: Notre Dame. Day 4: Montmartre.",
    included: "Guide, entry tickets, 3 breakfasts",
    notIncluded: "Hotel, flights, dinner",
    status: "published"
  },
  {
  name: "Tokyo Adventure",
  destination: "Japan",
  durationDays: 5,
  price: 599,
  maxCapacity: 12,
  startDate: new Date("2026-06-01"),
  endDate: new Date("2026-12-31"),
  itineraryText: "Day 1: Shibuya & Shinjuku. Day 2: Mount Fuji. Day 3: Tokyo Tower. Day 4: Akihabara. Day 5: Free day.",
  included: "Guide, train passes, 4 lunches",
  notIncluded: "Flights, hotel",
  status: "published"
}
];

async function addTours() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Tour.deleteMany({});
    await Tour.insertMany(sampleTours);
    console.log("✅ Tours added successfully!");
    process.exit();
  } catch (error) {
    console.error("Error:", error);
    process.exit();
  }
}

addTours();