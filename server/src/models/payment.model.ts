import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  employeeId: mongoose.Types.ObjectId;
  paymentType: 'salary' | 'advance' | 'loan' | 'on_account' | 'daily'; // راتب، سلف، عهد، تحت الحساب، يومية
  amount: number; // المبلغ الإجمالي (يُحسب تلقائياً إذا كان split payment)
  currency: 'EGP' | 'USD' | 'split'; // العملة - split للمدفوعات المقسمة
  amountEGP?: number; // المبلغ بالجنيه (للمدفوعات المقسمة)
  amountUSD?: number; // المبلغ بالدولار (للمدفوعات المقسمة)
  paymentMethod: 'cash' | 'bank_transfer' | 'check' | 'other';
  receiptNumber?: string; // رقم الإيصال
  description: string;
  paymentDate: Date;
  projectId?: mongoose.Types.ObjectId; // للمدفوعات المرتبطة بمشروع معين
  sectionId?: mongoose.Types.ObjectId; // للمدفوعات المرتبطة بقسم معين
  workQuantity?: number; // كمية العمل المنجز (للعمال باليومية)
  workUnit?: string; // وحدة قياس العمل (متر، كيلو، إلخ)
  approvedBy: string;
  country: 'egypt' | 'libya';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee ID is required'],
    },
    paymentType: {
      type: String,
      enum: ['salary', 'advance', 'loan', 'on_account', 'daily'],
      required: [true, 'Payment type is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be a positive number'],
    },
    currency: {
      type: String,
      enum: ['EGP', 'USD', 'split'],
      required: [true, 'Currency is required'],
    },
    amountEGP: {
      type: Number,
      min: [0, 'EGP amount must be a positive number'],
      validate: {
        validator: function (this: IPayment, value: number) {
          // amountEGP is required for split payments
          if (this.currency === 'split' && (!value || value <= 0)) {
            return false;
          }
          return true;
        },
        message: 'EGP amount is required for split payments'
      }
    },
    amountUSD: {
      type: Number,
      min: [0, 'USD amount must be a positive number'],
      validate: {
        validator: function (this: IPayment, value: number) {
          // amountUSD is required for split payments
          if (this.currency === 'split' && (!value || value <= 0)) {
            return false;
          }
          return true;
        },
        message: 'USD amount is required for split payments'
      }
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'bank_transfer', 'check', 'other'],
      required: [true, 'Payment method is required'],
    },
    receiptNumber: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    paymentDate: {
      type: Date,
      required: [true, 'Payment date is required'],
      default: Date.now,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
    sectionId: {
      type: Schema.Types.ObjectId,
      ref: 'Section',
    },
    workQuantity: {
      type: Number,
      min: [0, 'Work quantity must be a positive number'],
      validate: {
        validator: function (this: IPayment, value: number) {
          // Work quantity is required for daily payments
          if (this.paymentType === 'daily' && (!value || value <= 0)) {
            return false;
          }
          return true;
        },
        message: 'Work quantity is required for daily payments'
      }
    },
    workUnit: {
      type: String,
      trim: true,
      validate: {
        validator: function (this: IPayment, value: string) {
          // Work unit is required for daily payments
          if (this.paymentType === 'daily' && !value) {
            return false;
          }
          return true;
        },
        message: 'Work unit is required for daily payments'
      }
    },
    approvedBy: {
      type: String,
      required: [true, 'Approved by is required'],
      trim: true,
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

// Create indexes for efficient queries
paymentSchema.index({ country: 1 });
paymentSchema.index({ country: 1, employeeId: 1 });
paymentSchema.index({ country: 1, paymentType: 1 });
paymentSchema.index({ country: 1, paymentDate: -1 });
paymentSchema.index({ country: 1, currency: 1 });
paymentSchema.index({ country: 1, createdBy: 1 });
paymentSchema.index({ country: 1, projectId: 1 });
paymentSchema.index({ country: 1, sectionId: 1 });

const Payment = mongoose.model<IPayment>('Payment', paymentSchema);

export default Payment;
