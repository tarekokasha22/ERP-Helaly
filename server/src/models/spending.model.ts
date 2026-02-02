import mongoose, { Document, Schema } from 'mongoose';

export interface ISpending extends Document {
  _id: string;
  projectId: string;
  sectionId: string;
  amount: number;
  category: 'Materials' | 'Labor' | 'Equipment' | 'Overhead' | 'Other';
  description: string;
  date: Date;
  approvedBy: string;
  country: 'egypt' | 'libya';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const spendingSchema = new Schema<ISpending>(
  {
    _id: {
      type: String,
      required: true,
    },
    projectId: {
      type: String, // Changed from ObjectId
      ref: 'Project',
      required: [true, 'Project ID is required'],
    },
    sectionId: {
      type: String, // Changed from ObjectId
      ref: 'Section',
      required: [true, 'Section ID is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be a positive number'],
    },
    category: {
      type: String,
      enum: ['Materials', 'Labor', 'Equipment', 'Overhead', 'Other'],
      required: [true, 'Category is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    approvedBy: {
      type: String,
      required: false,
    },
    country: {
      type: String,
      enum: ['egypt', 'libya'],
      required: [true, 'Country is required'],
    },
    createdBy: {
      type: String, // Changed from ObjectId
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for country-based queries
spendingSchema.index({ country: 1 });
spendingSchema.index({ country: 1, projectId: 1 });
spendingSchema.index({ country: 1, sectionId: 1 });
spendingSchema.index({ country: 1, date: -1 });
spendingSchema.index({ country: 1, category: 1 });
spendingSchema.index({ country: 1, createdBy: 1 });

const Spending = mongoose.model<ISpending>('Spending', spendingSchema);

export default Spending; 