const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken'); // Bạn cần import jwt nếu dùng

const { register, login, changePassword } = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { session: false }),
    (req, res) => {
        const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token });
    });

router.get('/facebook', passport.authenticate('facebook'));

router.get('/facebook/callback',
    passport.authenticate('facebook', { session: false }),
    (req, res) => {
        const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token });
    });

router.put('/change-password', authMiddleware, changePassword);

module.exports = router;
