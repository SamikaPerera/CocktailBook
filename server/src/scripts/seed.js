// Seed script: creates (or resets) one manager and one bartender account,
// and loads the starter library of cocktails from around the world.
// Run with:  npm run seed
//
// It is safe to run more than once:
//  - existing accounts are updated, not duplicated
//  - existing specs are never overwritten (a manager may have edited them);
//    only a missing "origin" is filled in
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Spec from '../models/Spec.js';
import SpecChange from '../models/SpecChange.js';
import { worldCocktails } from './data/worldCocktails.js';
import { cocktailLibrary } from './data/cocktailLibrary.js';

const seedUsers = [
  {
    name: 'Bar Manager',
    email: process.env.SEED_MANAGER_EMAIL || 'manager@cocktailbook.test',
    password: process.env.SEED_MANAGER_PASSWORD || 'Manager123',
    role: 'manager',
  },
  {
    name: 'Bartender',
    email: process.env.SEED_BARTENDER_EMAIL || 'bartender@cocktailbook.test',
    password: process.env.SEED_BARTENDER_PASSWORD || 'Bartender123',
    role: 'bartender',
  },
];

// Same rule as the unique index: "Negroni" and "negroni" are the same drink.
const ignoreCase = { locale: 'en', strength: 2 };

// Library drinks are dated 30 days back, so they don't all show a "NEW"
// badge - that badge is for drinks the manager adds or changes.
const LIBRARY_DATE = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

async function seed() {
  await connectDB(process.env.MONGODB_URI);

  console.log('\nUsers:');
  let manager;
  for (const data of seedUsers) {
    // Find by email, or create a new user. We use save() (not updateOne) so
    // the pre('save') hook runs and the password gets hashed.
    const user = (await User.findOne({ email: data.email })) || new User({ email: data.email });
    user.name = data.name;
    user.password = data.password;
    user.role = data.role;
    await user.save();
    if (data.role === 'manager') manager = user;

    console.log(`  ✔ ${data.role.padEnd(9)} ${data.email}  /  ${data.password}`);
  }

  const library = [...worldCocktails, ...cocktailLibrary];

  // Load every existing spec name once (much faster than one query per drink).
  const existing = await Spec.find({}, { name: 1, origin: 1 }).collation(ignoreCase);
  const existingByName = new Map(existing.map((s) => [s.name.toLowerCase(), s]));

  // Fill in a missing origin on existing specs. timestamps: false -> this
  // doesn't count as an "update", so no UPDATED badge appears.
  let originFilled = 0;
  for (const data of library) {
    const spec = existingByName.get(data.name.toLowerCase());
    if (spec && !spec.origin && data.origin) {
      await Spec.updateOne({ _id: spec._id }, { $set: { origin: data.origin } }, { timestamps: false });
      originFilled += 1;
    }
  }

  // Insert all new drinks in one go. insertMany still runs schema validation.
  const toAdd = library
    .filter((data) => !existingByName.has(data.name.toLowerCase()))
    .map((data) => ({ ...data, createdBy: manager._id, updatedBy: manager._id }));

  if (toAdd.length > 0) {
    const inserted = await Spec.insertMany(toAdd);
    const ids = inserted.map((s) => s._id);
    // Back-date them. Mongoose never lets "createdAt" change, so we write
    // through the raw MongoDB collection (Model.collection) instead.
    await Spec.collection.updateMany({ _id: { $in: ids } }, { $set: { createdAt: LIBRARY_DATE, updatedAt: LIBRARY_DATE } });
    const changes = await SpecChange.insertMany(ids.map((id) => ({ spec: id, action: 'created', changedBy: manager._id })));
    await SpecChange.collection.updateMany({ _id: { $in: changes.map((c) => c._id) } }, { $set: { createdAt: LIBRARY_DATE } });
  }

  const countries = new Set(library.map((c) => c.origin).filter(Boolean)).size;
  console.log(`\nCocktail library (${library.length} drinks from ${countries} countries):`);
  console.log(`  ✔ ${toAdd.length} added, ${originFilled} existing specs given an origin, ${library.length - toAdd.length} already in the database`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err.message);
  process.exit(1);
});
