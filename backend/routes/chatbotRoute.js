const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const handleImageUpload = require('../middlewares/uploadMiddleware');
router.post('/', handleImageUpload, chatbotController.createChatbot);

module.exports = router;