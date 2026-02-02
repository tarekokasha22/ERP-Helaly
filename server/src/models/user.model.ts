import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'worker';
  position: string;
  active: boolean;
  country: 'egypt' | 'libya';
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
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
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['admin', 'worker'],
      default: 'worker',
    },
    position: {
      type: String,
      default: '',
    },
    active: {
      type: Boolean,
      default: true,
    },
    country: {
      type: String,
      enum: ['egypt', 'libya'],
      required: [true, 'Country is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Remove password when converting to JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Create compound index for email and country to ensure unique emails per country
userSchema.index({ email: 1, country: 1 }, { unique: true });

const User = mongoose.model<IUser>('User', userSchema);

export default User; 