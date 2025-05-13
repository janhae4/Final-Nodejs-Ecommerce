const passport = require('passport');
const express = require('express');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const authService = require('../services/authService');
const app = express();

// Cấu hình Passport Google OAuth2
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/api/auth/google/callback',
},
function(accessToken, refreshToken, profile, done) {
    // console.log("Google profile:", profile); // Log profile của người dùng
    const { email, given_name, family_name } = profile._json; // Lấy email và tên người dùng
    const fullName = `${given_name} ${family_name}`;

    const user = { 
      email,
      fullName,
      googleId: profile.id,
    };

    return done(null, user);
  }
));

// Cấu hình Route cho Google OAuth
app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

app.get('/api/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    // Sau khi xác thực thành công, lưu thông tin người dùng vào session
    req.login(req.user, (err) => {
      if (err) {
        return res.redirect('/');  // Redirect về trang login nếu có lỗi
      }
      console.log("User authenticated successfully, redirecting to home...");
      res.redirect('/');  // Chuyển hướng tới trang chủ
    });
  });

// Cấu hình Passport Facebook OAuth


passport.use(
  new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: 'http://localhost:3000/api/auth/facebook/callback',
    profileFields: ['id', 'emails', 'name']
  },
  async function(accessToken, refreshToken, profile, done) {
    try {
      const { id, name, emails } = profile;
      const email = emails?.[0]?.value || null;
      const fullName = `${name?.givenName || ''} ${name?.familyName || ''}`.trim();

      // ⚠️ Nếu không có email thì tạo user tạm và yêu cầu bổ sung sau
      const user = await authService.facebookLogin({
        email: email || `fb_user_${id}@placeholder.com`, // Email giả để tạo user tạm
        fullName,
        facebookId: id
      });

      // Gắn thêm cờ thiếu email
      user.isMissingEmail = !email;

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  })
);



app.get('/auth/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);

// Route callback từ Facebook
app.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/'); 
  }
);

