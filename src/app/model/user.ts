import mongoose from 'mongoose'
const { Schema, model } = mongoose;

export interface UserDocument {
    _id: string;
    email: string;
    name: string;
    phone: string;
    image: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema({
    email: {
      type: String,
      unique: true,
      required: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Email is invalid",
      ],
    },
    name: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true,
  }
);

const  User  =  mongoose.models.User  ||  model('User', UserSchema);
export default User;