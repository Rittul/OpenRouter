const express = require("express");
const chatRouter = express.Router();
const prisma = require("../config/prisma");
const userauth = require("../middleware/auth");
const generateGeminiResponse = require("../services/providers/gemini");
const rateLimit = require("../middleware/rateLimit");

chatRouter.post("/completion", userauth, rateLimit,async (req, res) => {
  try {
    const userid = req.user;

    const { conversationId, content ,slug} = req.body;

    let modelSlug;

    if (slug) {
      modelSlug = slug;
    } else {
      modelSlug = "gemini-2.5-flash";
    }

    if(modelSlug!="gemini-2.5-flash"){
      return res.json({messages:`${slug} is not supported yet! due to garibi`});
    }
    // validate content
    if (!content) {
      return res.status(400).json({
        message: "Content required",
      });
    }

    // check conversation ownership
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        user_id: userid,
      },
    });

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }
    const credit = await prisma.credit.findUnique({
      where: {
        user_id: userid,
      },
    });
    if (Number(credit.balance) <= 0.01) {
      return res.status(400).json({
        message: "Insufficient credits",
      });
    }
    // save user message
    // console.log(conversationId);
    await prisma.message.create({
      data: {
        conversation_id: conversationId,
        role: "user",
        content,
      },
    });

    // fetch old messages
    const messages = await prisma.message.findMany({
      where: {
        conversation_id: conversationId,
      },
      orderBy: {
        created_at: "asc",
      },
    });

    // convert for gemini or other model
    const formattedMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // generate AI response
    const aiResponse = await generateGeminiResponse(formattedMessages);
    const mapping =await prisma.modelProviderMapping.findFirst({
      where:{
        model:{
          slug:modelSlug
        }
      },
      include:{
        model:true,
        provider:true
      }
    });
    if (!mapping) {
      return res.status(400).json({
        message:"Unsupported model"
      });
    }

    const inputCost =Number(aiResponse.input_tokens) * Number(mapping.input_token_cost);

    const outputCost =Number(aiResponse.output_tokens+aiResponse.thinking_tokens) *Number(mapping.output_token_cost);

    const totalCost = inputCost + outputCost;

    await prisma.$transaction([
      prisma.message.create({
        data: {
          conversation_id: conversationId,
          role: "assistant",
          content: aiResponse.content,
          model_provider_mapping_id: mapping.id,
          input_tokens: aiResponse.input_tokens,
          output_tokens: aiResponse.output_tokens,
          cost: totalCost,
        },
      }),

      prisma.transaction.create({
        data: {
          user_id: userid,
          type: "usage",
          amount: totalCost,
          status: "success",
          provider: "gemini",
        },
      }),

      prisma.credit.update({
        where: {
          user_id: userid,
        },
        data: {
          balance: {
            decrement: totalCost,
          },
        },
      }),
    ]);
    // return response
    return res.json({
      response: aiResponse.content,
    });
  } catch (err) {
    console.log(err);
    if (err.status === 503) {
    return res.status(503).json({
      message:
        "Gemini is currently experiencing high demand. Please try again in a few moments.",
    });
  }
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

chatRouter.get("/getmessages/:id", userauth, async (req, res) => {
  try {
    const userid = req.user;
    const conversationId = parseInt(req.params.id);
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        user_id: userid,
      },
    });

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    const response = await prisma.message.findMany({
      where: {
        conversation_id: conversationId,
      },
      orderBy: {
        created_at: "asc",
      },
    });
    return res.json({
      messages: response
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

chatRouter.get("/getconvo", userauth, async (req, res) => {
  const userid=req.user;
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        user_id: userid,
      },
      include: {
        messages: {
          take: 1,
          orderBy: {
            created_at: "asc",
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });
    res.json({ conversations });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

module.exports = chatRouter;
