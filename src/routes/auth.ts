import express, { Router } from "express";
import passport from "passport";
import dotenv from "dotenv";
const router = express.Router();
dotenv.config();

const GoogleStrategy = require("passport-google-oauth20").Strategy;
const TwitterStrategy = require("passport-twitter").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`,
    },
    function (
      accessToken: any,
      refreshToken: any,
      profile: any,
      cb: (arg0: any, arg1: any) => void
    ) {
      // authemtication successfull
      // insert user into db
      // User.findOrCreate({ googleId: profile.id }, function (err, user) {
      //   return cb(err, user);
      // });
      console.log(profile);
      cb(null, profile);
    }
  )
);

passport.use(
  new TwitterStrategy(
    {
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/auth/twitter/callback`,
    },
    function (
      accessToken: any,
      refreshToken: any,
      profile: any,
      cb: (arg0: any, arg1: any) => void
    ) {
      // authemtication successfull
      // insert user into db
      // User.findOrCreate({ googleId: profile.id }, function (err, user) {
      //   return cb(err, user);
      // });
      console.log(profile);
      cb(null, profile);
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
      // authemtication successfull
      // insert user into db
      // User.findOrCreate({ googleId: profile.id }, function (err, user) {
      //   return cb(err, user);
      // });
      console.log(profile);
      cb(null, profile);
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
router.get("/google", passport.authenticate("google", { scope: ["profile"] }));

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
