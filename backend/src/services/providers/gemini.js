const { GoogleGenerativeAI } =
require("@google/generative-ai");

const genAI =
new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

const model =
genAI.getGenerativeModel({
  model: "gemini-2.5-flash"
});

const generateGeminiResponse =
async (messages) => {

  try {

    const prompt = messages
      .map(
        msg =>
        `${msg.role}: ${msg.content}`
      )
      .join("\n");

    const result =
      await model.generateContent(prompt);

    const response =
      result.response;

    return {

      content: response.text(),

      input_tokens:
        response.usageMetadata
        ?.promptTokenCount || 0,

      output_tokens:
        response.usageMetadata
        ?.candidatesTokenCount || 0,

      thinking_tokens:response.usageMetadata?.thoughtsTokenCount || 0,

      total_tokens:
        response.usageMetadata
        ?.totalTokenCount || 0
    };

  } catch (error) {

    console.log(error);

    throw error;
  }
};

module.exports =generateGeminiResponse;