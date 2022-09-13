import express from "express";
import passport from "passport";
import dotenv from "dotenv";
import User from "../models/user";
import { IUser } from "src/utils/types";
import { Error } from "mongoose";

const router = express.Router();
dotenv.config();

const GoogleStrategy = require("passport-google-oauth20").Strategy;
const TwitterStrategy = require("passport-twitter").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;

const registerUser = async (
  email: string,
  authProvider: string,
  providerId: string,
  username: string
) => {
  return new Promise((resolve, reject) => {
    User.findOne({ providerId: providerId }, async (err: Error, doc: IUser) => {
      if (err) reject(err);
      if (!doc) {
        User.create(
          {
            authProvider: authProvider,
            providerId: providerId,
            email: email,
            username: username,
          },
          async (err: Error, doc: any) => {
            if (err) reject(err);
            resolve({
              message: "registered",
              data: doc,
            });
          }
        );
      } else {
        // SG 09/13/2022 12:57  user exists
        resolve({
          message: "logged in",
          data: doc,
        });
      }
    });
  });
};

interface DB_RESPONSE_RESGISTER_CHECK {
  message: String;
  data: any;
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`,
    },
    async function (
      accessToken: any,
      refreshToken: any,
      profile: any,
      cb: (arg0: any, arg1: any) => void
    ) {
      registerUser(
        profile.emails[0].value,
        "google",
        profile.id,
        profile.displayName
      )
        .then((res: DB_RESPONSE_RESGISTER_CHECK) => {
          console.log(res);
          cb(null, profile);
        })
        .catch((e) => {
          console.log(e);
          // TODO: return a error page here
          cb(`404 ERROR OCCURED\n ${e.message}`, null);
        });
    }
  )
);

passport.use(
  new TwitterStrategy(
    {
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      includeEmail: true,
      callbackURL: `${process.env.BACKEND_URL}/auth/twitter/callback`,
    },
    function (
      accessToken: any,
      refreshToken: any,
      profile: any,
      cb: (arg0: any, arg1: any) => void
    ) {
      registerUser(
        profile.emails[0].value,
        "twitter",
        profile.id,
        profile.displayName
      )
        .then((res: DB_RESPONSE_RESGISTER_CHECK) => {
          console.log(res);
          cb(null, profile);
        })
        .catch((e) => {
          console.log(e);
          // TODO: return a error page here
          cb(`404 ERROR OCCURED\n ${e.message}`, null);
        });
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/auth/github/callback`,
    },
    function (
      accessToken: any,
      refreshToken: any,
      profile: any,
      cb: (arg0: any, arg1: any) => void
    ) {
      registerUser(
        profile.emails[0].value,
        "github",
        profile.id,
        profile.displayName
      )
        .then((res: DB_RESPONSE_RESGISTER_CHECK) => {
          console.log(res);
          cb(null, profile);
        })
        .catch((e) => {
          console.log(e);
          // TODO: return a error page here
          cb(`404 ERROR OCCURED\n ${e.message}`, null);
        });
    }
  )
);

passport.serializeUser((user, done) => {
  return done(null, user);
});

passport.deserializeUser((user, done) => {
  return done(null, user);
});

/******** Setting up Routes & callback routes ********/

// SG 09/13/2022 01:29  Google routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect(process.env.FRONTEND_URL);
  }
);

// SG 09/13/2022 02:10  twitter route
router.get("/twitter", passport.authenticate("twitter"));

router.get(
  "/twitter/callback",
  passport.authenticate("twitter", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect(process.env.FRONTEND_URL);
  }
);

// SG 09/13/2022 02:10  Github route
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect(process.env.FRONTEND_URL);
  }
);

export default router;
