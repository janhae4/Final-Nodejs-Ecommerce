const chatbotService = require('../services/chatbotService');
exports.createChatbot = async (req, res) => {
    try {
        const { prompt } = req.body;
        const response = await chatbotService.createChatbot(prompt);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}