const path = require("path");
const ai = require("../database/aiConnection");
const ProductService = require("../services/productService");
const fs = require("fs");
const { createUserContent, createPartFromUri } = require("@google/genai");
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
            text: `You are a helpful product assistant. 
            Recommend products based on user's need if they're looking for\n. ${productList}.\n 
            If else, answer the question. You can modify the answer to fit the user's need.
            If user send anything else, answer with "I'm sorry, I don't understand."
            IF user send a question that is not related to the products, answer with "I'm sorry, I don't understand."
            If user send a picture, please analyze it and give the product have related content of images, if a picture is not related of the contents of proucts, answer "I'm sorry, I don't know how to help you with that."`,
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

exports.getImageDescription = async (prompt, imagePath) => {
  const products = await ProductService.getAllProducts();
  const productList = products
    .map((p) => `- ${p.nameProduct} (${p.price}): ${p.shortDescription}`)
    .join("\n");
  const finalPrompt = `You are a helpful product assistant. 
  Recommend products based on user's need if they're looking for\n. ${productList}.\n 
  If else, answer the question. You can modify the answer to fit the user's need.
  If user send anything else, answer with "I'm sorry, I don't understand."
  IF user send a question that is not related to the products, answer with "I'm sorry, Our store didn't have this product yet!".
  And my question is ${prompt}`;
  const filePath = path.join(__dirname, "..", imagePath);
  const myfile = await ai.files.upload({
    file: filePath,
    config: { mimeType: "image/jpeg" },
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: createUserContent([
      createPartFromUri(myfile.uri, myfile.mimeType),
      `${finalPrompt}`,
    ]),
  });
  return response.text;
};
