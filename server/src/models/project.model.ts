import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'not_started' | 'in_progress' | 'completed';
  budget: number;
  manager: string;
  totalLength: number;
  unit: 'km' | 'm' | 'sq_m' | 'units';
  progress?: number;
  location: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  country: 'egypt' | 'libya';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started',
    },
    budget: {
      type: Number,
      required: [true, 'Budget is required'],
      min: [0, 'Budget must be a positive number'],
    },
    manager: {
      type: String,
      required: [true, 'Project manager is required'],
    },
    totalLength: {
      type: Number,
      required: [true, 'Total length/quantity is required'],
      min: [0, 'Total length must be a positive number'],
    },
    unit: {
      type: String,
      enum: ['km', 'm', 'sq_m', 'units'],
      required: [true, 'Unit is required'],
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
    },
    clientName: {
      type: String,
      required: [true, 'Client name is required'],
    },
    clientEmail: {
      type: String,
      required: [true, 'Client email is required'],
    },
    clientPhone: {
      type: String,
      required: [true, 'Client phone is required'],
    },
    country: {
      type: String,
      enum: ['egypt', 'libya'],
      required: [true, 'Country is required'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Create index for country-based queries
projectSchema.index({ country: 1 });
projectSchema.index({ country: 1, status: 1 });
projectSchema.index({ country: 1, createdBy: 1 });

const Project = mongoose.model<IProject>('Project', projectSchema);

export default Project; 