const ai = require("../database/aiConnection");
const ProductService = require("../services/productService");
const model = "gemini-2.0-flash";
exports.createChatbot = async (prompt) => {
  const products = await ProductService.getAllProducts();
  const productList = products
    .map((p) => `- ${p.nameProduct} (${p.price}): ${p.shortDescription}`)
    .join("\n");
  const chat = ai.chats.create({
    model,
    history: [
      {
        role: "user",
        parts: [
          {
            text: `You are a helpful product assistant. Recommend products based on user's need if they're looking for\n. ${productList}.\n If else, answer the question. You can modify the answer to fit the user's need.`,
          },
        ],
      },
      {
        role: "model",
        parts: [{ text: "Ok, sure!" }],
      },
    ],
  });

  const response = await chat.sendMessage({
    message: prompt,
  });

  const text = response.text || "No response.";
  return text;
};

exports.analyzeSentiment = async (reviewText) => {
  const response = await ai.generateContent({
    model,
    contents: [
      {
        role: "system",
        parts: [
          {
            text: "You are a sentiment analysis tool. Tell if the review is Positive, Negative, or Neutral.",
          },
        ],
      },
      {
        role: "user",
        parts: [{ text: reviewText }],
      },
    ],
  });

  const output = await response.response;
  const sentiment =
    output.candidates?.[0]?.content?.parts?.[0]?.text || "Unknown";
  return sentiment;
};

exports.getImageDescription = async (imagePath) => {
  const imageBase64 = fs.readFileSync(imagePath, { encoding: "base64" });

  const response = await ai.generateContent({
    model,
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageBase64,
            },
          },
          {
            text: "What product is in this image? Describe it clearly in short phrases.",
          },
        ],
      },
    ],
  });

  const text = await response.text();
  return text;
};
