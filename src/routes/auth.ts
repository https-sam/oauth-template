const config = require("../../config.default");
import express from "express";
import passport from "passport";
import User from "../models/user";
import { IUser } from "src/utils/types";
import { Error } from "mongoose";

const router = express.Router();

const GoogleStrategy = require("passport-google-oauth20").Strategy;
const TwitterStrategy = require("passport-twitter").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;

interface USER_SERIALIZATION_RESPONSE {
  message: String;
  data: IUser;
}

// SG 09/13/2022 14:05
// if user doesnt exist, initialize user in db otheriwise, return exisitng data
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
        // SG 09/15/2022 23:08 passing the response from db
        resolve({
          message: "logged in",
          data: doc,
        });
        // SG 09/13/2022 12:57 user exists, update the data in db
        // User.findOneAndUpdate(
        //   { providerId: providerId },
        //   latestUserData,
        //   (err: Error, updatedDoc: IUser) => {
        //     if (err) {
        //       // SG 09/13/2022 17:55  error updating value, return old data
        //       resolve({
        //         message: "logged in",
        //         data: doc,
        //       });
        //     }
        //     // SG 09/13/2022 18:46  return updated data
        //     resolve({
        //       message: "logged in",
        //       data: updatedDoc,
        //     });
        //   }
        // );
      }
    });
  });
};

passport.use(
  new GoogleStrategy(
    {
      clientID: config.googlePassport.client,
      clientSecret: config.googlePassport.secret,
      callbackURL: "/auth/google/callback",
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
        `${profile.name.givenName} ${profile.name.familyName}`,
        profile.photos[0].value
      )
        .then((res: USER_SERIALIZATION_RESPONSE) => {
          cb(null, res);
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
      consumerKey: config.twitterPassport.consumer,
      consumerSecret: config.twitterPassport.secret,
      includeEmail: true,
      callbackURL: "/auth/twitter/callback",
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
          cb(null, res);
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
      clientID: config.githubPassport.client,
      clientSecret: config.githubPassport.secret,
      callbackURL: "/auth/github/callback",
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
          cb(null, res);
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
passport.serializeUser((user: USER_SERIALIZATION_RESPONSE, done) => {
  return done(null, user.data._id);
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

// SG 09/16/2022 22:42, can ONLY be used for auth callback endpoints
// redirect user to home page if user has already created an account
// redirect user to registraion page if user has just signed up
const resirectUser = (req: any, res: any) => {
  const authStatus = req.user.message || "";
  if (authStatus && authStatus === "registered") {
    res.redirect(`${config.frontendURL}/register`);
  } else {
    res.redirect(config.frontendURL);
  }
};

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => resirectUser(req, res)
);

// SG 09/13/2022 02:10  twitter route
router.get("/twitter", passport.authenticate("twitter"));

router.get(
  "/twitter/callback",
  passport.authenticate("twitter", { failureRedirect: "/login" }),
  (req, res) => resirectUser(req, res)
);

// SG 09/13/2022 02:10  Github route
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => resirectUser(req, res)
);

// SG 09/14/2022 14:37 logs the user out of session
router.get("/logout", (req, res) => {
  if (req.user) {
    req.logout((err) => {
      if (err) res.send("failed");
      res.send("success");
    });
  }
});

export default router;
