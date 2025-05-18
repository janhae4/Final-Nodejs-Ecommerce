const chatbotService = require("../services/chatbotService");
exports.createChatbot = async (req, res) => {
  try {
    const { prompt } = req.body;
    let response;
    if (req.filePath) {
        response = await chatbotService.getImageDescription(prompt, req.filePath);
    }
    else {
        response = await chatbotService.createChatbot(prompt);
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
