import mongoose from "mongoose";

const user = new mongoose.Schema({
  // twitterId: {
  //   required: false,
  //   type: String,
  // },
  // githubId: {
  //   required: false,
  //   type: String,
  // },
  // googleId: {
  //   required: false,
  //   type: String,
  // },

  // SG 09/13/2022 08:50 login provider
  authProvider: {
    required: true,
    type: String,
  },
  username: {
    required: true,
    type: String,
  },
});

export default mongoose.model("user", user);
