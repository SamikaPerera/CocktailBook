// SpecChange model: one entry in a spec's change history.
// Every time a manager creates or edits a spec, we record WHO changed
// WHAT and WHEN. Bartenders see this as "What changed" on the spec page.
import mongoose from 'mongoose';

// One changed field, e.g. { field: 'Garnish', from: 'Lemon peel', to: 'Orange twist' }.
// For ingredients: from = null means "added", to = null means "removed".
const fieldChangeSchema = new mongoose.Schema(
  {
    field: { type: String, required: true },
    from: { type: String, default: null },
    to: { type: String, default: null },
  },
  { _id: false },
);

const specChangeSchema = new mongoose.Schema(
  {
    spec: { type: mongoose.Schema.Types.ObjectId, ref: 'Spec', required: true, index: true },
    action: { type: String, enum: ['created', 'updated'], required: true },
    changes: { type: [fieldChangeSchema], default: [] },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  // History entries are never edited, so we only need createdAt.
  { timestamps: { createdAt: true, updatedAt: false } },
);

specChangeSchema.set('toJSON', {
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('SpecChange', specChangeSchema);
