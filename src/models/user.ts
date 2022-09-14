import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema({
  authProvider: {
    required: true,
    type: String,
  },
  providerId: {
    required: true,
    type: String,
  },
  email: {
    required: true,
    type: String,
  },
  username: {
    required: true,
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
    required: true,
  },
});

export default mongoose.model("User", userSchema);
