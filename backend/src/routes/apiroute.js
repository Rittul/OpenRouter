const express= require("express");
const apichatRouter = express.Router();
const prisma = require("../config/prisma");
const apiauth = require("../middleware/apikey");
const generateGeminiResponse = require("../services/providers/gemini");
const rateLimit = require("../middleware/rateLimit");

apichatRouter.post("/chat/completions", apiauth, rateLimit,async (req, res) => {
  try {

    const userid = req.user;

    const {
      model,
      messages
    } = req.body;

    // validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        message: "Messages are required"
      });
    }

    // default model
    const modelSlug = model || "gemini-2.5-flash";

    if (modelSlug !== "gemini-2.5-flash") {
      return res.status(400).json({
        message: `${modelSlug} is not supported yet! due to garibi`
      });
    }

    // check credits
    const credit = await prisma.credit.findUnique({
      where: {
        user_id: userid
      }
    });

    if (!credit || Number(credit.balance) <= 0.01) {
      return res.status(400).json({
        message: "Insufficient credits"
      });
    }

    // find model mapping
    const mapping = await prisma.modelProviderMapping.findFirst({
      where: {
        model: {
          slug: modelSlug
        }
      },
      include: {
        model: true,
        provider: true
      }
    });

    if (!mapping) {
      return res.status(400).json({
        message: "Unsupported model"
      });
    }

    // generate response
    const aiResponse =await generateGeminiResponse(messages);

    // calculate cost
    const inputCost =Number(aiResponse.input_tokens) *Number(mapping.input_token_cost);

    const outputCost =Number(aiResponse.output_tokens+aiResponse.thinking_tokens) *Number(mapping.output_token_cost);
    const totalCost =inputCost + outputCost;

    // save transaction + deduct credits
    await prisma.$transaction([

      prisma.transaction.create({
        data: {
          user_id: userid,
          type: "usage",
          amount: totalCost,
          status: "success",
          provider: mapping.provider.name
        }
      }),

      prisma.credit.update({
        where: {
          user_id: userid
        },
        data: {
          balance: {
            decrement: totalCost
          }
        }
      })

    ]);

    // response
    return res.json({

      model: modelSlug,

      content: aiResponse.content,

      usage: {

        input_tokens:aiResponse.input_tokens,

        output_tokens:aiResponse.output_tokens,
        thinking_tokens:aiResponse.thinking_tokens,
        total_tokens:aiResponse.total_tokens
      }
    });

  } catch (err) {

    console.log(err);

    if (err.status === 503) {
      return res.status(503).json({
        message:
          "Gemini is currently experiencing high demand. Please try again later."
      });
    }

    return res.status(500).json({
      message: "Internal server error"
    });

  }
});

module.exports = apichatRouter;