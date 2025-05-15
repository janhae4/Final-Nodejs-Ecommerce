const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require("../controllers/authController");
const jwt = require('jsonwebtoken');

const { register, login, changePassword,logout, forgotPassword } = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/change-password', authMiddleware, changePassword);
router.post("/logout", logout);
router.post('/forgot-password', forgotPassword);

// Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", 
  passport.authenticate("google", { session: false }), 
  authController.googleCallback
);


// Facebook OAuth
router.get("/facebook", passport.authenticate("facebook", { scope: ["email"] }));
router.get("/facebook/callback", passport.authenticate("facebook", { session: false }), authController.facebookCallback);

module.exports = router;
