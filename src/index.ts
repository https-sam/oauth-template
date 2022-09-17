require("dotenv").config();
const config = require("../config.default");
import express from "express";
import mongoose, { ConnectOptions } from "mongoose";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import authRouters from "./routes/auth";

const app = express();
const PORT = process.env.PORT || config.port;

const dbConnectRetry = () => {
  mongoose
    .connect(
      config.mongoURL as string,
      { useNewUrlParser: true, useUnifiedTopology: true } as ConnectOptions
    )
    .then(() => {
      console.log("Connected to mongo db");
    })
    .catch((e) => {
      console.log(`Mongoose connection error: ${e}`);
      setTimeout(dbConnectRetry, 5000);
    });
};

dbConnectRetry();

app.use(express.json());
app.use(cors({ origin: config.frontendURL, credentials: true }));
app.use(
  session({
    secret: config.sessionSecret,
    resave: true,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use("/auth", authRouters);

app.get("/", (req, res) => {
  res.send("Success");
});

// returns the logged in user's informaton obtained from the provider
app.get("/get_user", (req, res) => {
  res.send(req.user);
});

app.listen(PORT, () => {
  console.log(`Server initialized on ${PORT}`);
});
