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

interface USER_SERIALIZATION_RESPONSE {
  message: String;
  data: any;
}

// SG 09/13/2022 14:05 this function checks if the authenticated user exists in db
const serializeUser = (
  email: string,
  authProvider: string,
  providerId: string,
  username: string,
  name: string,
  profileImage: string
): Promise<USER_SERIALIZATION_RESPONSE | Error> => {
  return new Promise((resolve, reject) => {
    User.findOne({ providerId: providerId }, async (err: Error, doc: IUser) => {
      if (err) reject(err);
      const latestUserData = {
        authProvider: authProvider,
        providerId: providerId,
        email: email,
        username: username,
        name: name,
        profileImage: profileImage,
      };
      if (!doc) {
        // insert this user into database
        User.create(latestUserData, async (err: Error, doc: any) => {
          if (err) reject(err);
          resolve({
            message: "registered",
            data: doc,
          });
        });
      } else {
        // SG 09/13/2022 12:57 user exists, update the data in db
        User.findOneAndUpdate(
          { providerId: providerId },
          latestUserData,
          (err: Error, updatedDoc: IUser) => {
            console.log(updatedDoc);
            if (err) {
              // SG 09/13/2022 17:55  error updating value, return old data
              resolve({
                message: "logged in",
                data: doc,
              });
            }

            resolve({
              message: "logged in",
              data: updatedDoc,
            });
          }
        );
      }
    });
  });
};

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
      serializeUser(
        profile.emails[0].value,
        "google",
        profile.id,
        profile.displayName,
        `${profile.name.familyName} ${profile.name.givenName}`,
        profile.photos[0].value
      )
        .then((res: USER_SERIALIZATION_RESPONSE) => {
          cb(null, res.data);
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
      serializeUser(
        profile.emails[0].value,
        "twitter",
        profile.id,
        profile.username,
        profile.displayName,
        profile.photos[0].value
      )
        .then((res: USER_SERIALIZATION_RESPONSE) => {
          cb(null, res.data);
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
      serializeUser(
        profile.emails[0].value,
        "github",
        profile.id,
        profile.username,
        profile.displayName,
        profile.photos[0].value
      )
        .then((res: USER_SERIALIZATION_RESPONSE) => {
          cb(null, res.data);
        })
        .catch((e) => {
          console.log(e);
          // TODO: return a error page here
          cb(`404 ERROR OCCURED\n ${e.message}`, null);
        });
    }
  )
);

// SG 09/13/2022 18:30 only store user._id in session
passport.serializeUser((user: IUser, done) => {
  return done(null, user._id);
});

passport.deserializeUser((id: string, done) => {
  User.findById(id, (err: Error, doc: IUser) => {
    return done(null, doc);
  });
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
