import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  uname: String,
  email: String,
  phone: String,
  city: String,
  password: String, 
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
