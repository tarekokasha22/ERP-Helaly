import mongoose, { Document, Schema } from 'mongoose';

export interface ISection extends Document {
  _id: string;
  name: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed';
  assignedTo: string;
  targetQuantity: number;
  completedQuantity: number;
  progress?: number;
  projectId: string;
  country: 'egypt' | 'libya';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const sectionSchema = new Schema<ISection>(
  {
    _id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Section name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Section description is required'],
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started',
    },
    assignedTo: {
      type: String,
      required: [true, 'Assigned to is required'],
    },
    targetQuantity: {
      type: Number,
      required: [true, 'Target quantity is required'],
      min: [0, 'Target quantity must be a positive number'],
    },
    completedQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Completed quantity must be a positive number'],
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    projectId: {
      type: String, // Changed from ObjectId
      ref: 'Project',
      required: [true, 'Project ID is required'],
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

// Automatically calculate progress before saving
sectionSchema.pre('save', function (this: ISection, next: () => void) {
  if (this.targetQuantity > 0) {
    this.progress = Math.round((this.completedQuantity / this.targetQuantity) * 100);
  }
  next();
});

// Create indexes for country-based queries
sectionSchema.index({ country: 1 });
sectionSchema.index({ country: 1, projectId: 1 });
sectionSchema.index({ country: 1, status: 1 });
sectionSchema.index({ country: 1, createdBy: 1 });

const Section = mongoose.model<ISection>('Section', sectionSchema);

export default Section; 