import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { db } from "../models";
import { config } from "../config";

const googleStatergy = new GoogleStrategy(
  {
    clientID: config.google.client.id,
    clientSecret: config.google.client.secret,
    callbackURL: "/api/auth/google/callback",
  },
  async (accessToken, refreshToken, profileData, cb) => {
    console.log("Google Profile", profileData);
    const profile = profileData._json;
    try {
      let user = await db.User.findOne({ email: profile.email }).select(
        "-password"
      );

      if (!user) {
        user = await db.User.create({
          firstname: profile?.given_name,
          lastname: profile?.family_name,
          email: profile?.email,
          profilePicture: profile?.picture,
          isOAuthUser: true,
          isVerified: true,
        });
      }

      cb(null, user);
    } catch (err) {
      cb(err, null);
    }
  }
);

export const OAuthConfig = passport.use(googleStatergy);

passport.serializeUser((user: any, cb) => {
  cb(null, user.id);
});

passport.deserializeUser(async (id: string, cb) => {
  try {
    const user = await db.User.findById(id);
    cb(null, user);
  } catch (err) {
    cb(err, null);
  }
});
