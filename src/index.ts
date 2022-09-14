require("dotenv").config();
import express from "express";
import mongoose, { ConnectOptions } from "mongoose";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import authRouters from "./routes/auth";

const app = express();
const PORT = process.env.PORT || 8080;

mongoose
  .connect(
    process.env.MONGO_URI as string,
    { useNewUrlParser: true, useUnifiedTopology: true } as ConnectOptions
  )
  .then(() => {
    console.log("Connected to mongo db");
  });

// { useNewUrlParser: true, useUnifiedTopology: true } as ConnectOptions,

app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use("/auth", authRouters);

app.get("/", (req, res) => {
  res.send("Root dir: success");
});

// returns the logged in user's informaton obtained from the provider
app.get("/get_user", (req, res) => {
  res.send(req.user);
});

app.listen(PORT, () => {
  console.log(`Server initialized on ${PORT}`);
});
