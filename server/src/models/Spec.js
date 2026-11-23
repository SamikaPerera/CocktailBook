// Spec model: one house cocktail specification.
import mongoose from 'mongoose';

// Fixed list of categories so filtering works reliably (no "Sour" vs "sours").
// The client has a matching list in client/src/constants/categories.js.
export const CATEGORIES = [
  'Signature',
  'Classic',
  'Sour',
  'Highball',
  'Stirred',
  'Tiki',
  'Spritz',
  'Shot',
  'Non-alcoholic',
];

// A sub-document: each ingredient has a name and a measure, e.g. "Gin" / "50 ml".
// _id: false because ingredients don't need their own ids.
const ingredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    measure: { type: String, required: true, trim: true, maxlength: 40 },
  },
  { _id: false },
);

const specSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    category: { type: String, required: true, enum: CATEGORIES },
    ingredients: {
      type: [ingredientSchema],
      validate: {
        validator: (list) => list.length > 0,
        message: 'A spec needs at least one ingredient',
      },
    },
    glass: { type: String, required: true, trim: true, maxlength: 60 },
    ice: { type: String, required: true, trim: true, maxlength: 60 },
    garnish: { type: String, required: true, trim: true, maxlength: 100 },
    method: { type: String, required: true, trim: true, maxlength: 2000 },
    photoUrl: { type: String, trim: true, default: '' },
    // Country the drink comes from, e.g. "Italy" (optional).
    origin: { type: String, trim: true, maxlength: 60, default: '' },

    // Who created / last changed the spec (useful for accountability).
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

// One spec per drink name, ignoring upper/lower case ("Negroni" = "negroni").
// This is what guarantees "one correct version of each drink".
specSchema.index(
  { name: 1 },
  { unique: true, collation: { locale: 'en', strength: 2 } },
);

specSchema.set('toJSON', {
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('Spec', specSchema);
