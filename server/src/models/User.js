// User model: everyone who can log in to CocktailBook.
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// The two roles in the system. Managers can edit specs; bartenders can only read.
export const ROLES = ['manager', 'bartender'];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,      // creates a unique index: no two users with the same email
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false,     // never returned by queries unless explicitly asked for
    },
    role: {
      type: String,
      enum: ROLES,
      default: 'bartender',
    },
  },
  { timestamps: true }, // adds createdAt and updatedAt automatically
);

// Before saving, hash the password with bcrypt.
// We only hash when the password was changed, otherwise we'd hash the hash.
userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  // 12 "salt rounds" = how slow the hash is. Slower = harder to brute-force.
  this.password = await bcrypt.hash(this.password, 12);
});

// Instance method: compare a plain-text login attempt with the stored hash.
userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Control what is sent to the client when a user is converted to JSON.
userSchema.set('toJSON', {
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password; // extra safety: never leak the hash
    return ret;
  },
});

export default mongoose.model('User', userSchema);
