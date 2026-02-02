import mongoose, { Document, Schema } from 'mongoose';

export interface IEmployee extends Document {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  employeeType: 'monthly' | 'daily' | 'piecework'; // موظف شهري أو عامل باليومية أو بالقطعة
  position: string;
  monthlySalary?: number; // الراتب الشهري للموظفين
  dailyRate?: number; // السعر اليومي للعمال
  pieceworkRate?: number; // سعر القطعة/المتر للعمل بالقطعة
  currency: 'EGP' | 'USD'; // العملة الأساسية
  country: 'egypt' | 'libya';
  active: boolean;
  hireDate: Date;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const employeeSchema = new Schema<IEmployee>(
  {
    _id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      trim: true,
    },
    employeeType: {
      type: String,
      enum: ['monthly', 'daily', 'piecework'],
      required: [true, 'Employee type is required'],
    },
    position: {
      type: String,
      required: [true, 'Position is required'],
      trim: true,
    },
    monthlySalary: {
      type: Number,
      min: [0, 'Monthly salary must be a positive number'],
      validate: {
        validator: function (this: IEmployee, value: number) {
          // Monthly salary is required only for monthly employees
          if (this.employeeType === 'monthly' && (!value || value <= 0)) {
            return false;
          }
          return true;
        },
        message: 'Monthly salary is required for monthly employees'
      }
    },
    dailyRate: {
      type: Number,
      min: [0, 'Daily rate must be a positive number'],
      validate: {
        validator: function (this: IEmployee, value: number) {
          // Daily rate is required only for daily employees
          if (this.employeeType === 'daily' && (!value || value <= 0)) {
            return false;
          }
          return true;
        },
        message: 'Daily rate is required for daily employees'
      }
    },
    pieceworkRate: {
      type: Number,
      min: [0, 'Piecework rate must be a positive number'],
      validate: {
        validator: function (this: IEmployee, value: number) {
          // Piecework rate is required only for piecework employees
          if (this.employeeType === 'piecework' && (!value || value <= 0)) {
            return false;
          }
          return true;
        },
        message: 'Piecework rate is required for piecework employees'
      }
    },
    currency: {
      type: String,
      enum: ['EGP', 'USD'],
      default: 'EGP',
    },
    country: {
      type: String,
      enum: ['egypt', 'libya'],
      required: [true, 'Country is required'],
    },
    active: {
      type: Boolean,
      default: true,
    },
    hireDate: {
      type: Date,
      required: [true, 'Hire date is required'],
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: String, // Changed from ObjectId for compatibility
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient queries
employeeSchema.index({ country: 1 });
employeeSchema.index({ country: 1, employeeType: 1 });
employeeSchema.index({ country: 1, active: 1 });
employeeSchema.index({ country: 1, createdBy: 1 });

const Employee = mongoose.model<IEmployee>('Employee', employeeSchema);

export default Employee;
