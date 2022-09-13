import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import authRouters from "./routes/auth";

const app = express();
const PORT = process.env.PORT || 8080;

dotenv.config();

mongoose.connect(process.env.MONGOOSE_URI as string, {}, () => {
  console.log("Connected to mongo db");
});

//middle ware
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(
  session({
    secret: "secretcode",
    resave: true,
    saveUninitialized: true,
  })
);
app.use("/auth", authRouters);

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.send("Hello");
});

app.get("/get_user", (req, res) => {
  res.send(req.user);
});

app.listen(PORT, () => {
  console.log(`Server initialized on ${PORT}`);
});