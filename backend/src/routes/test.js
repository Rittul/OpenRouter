const express = require("express");
const router = express.Router();

const generateGeminiResponse =
require("../services/providers/gemini");

router.get("/test", async (req, res) => {

  const response =
    await generateGeminiResponse([
      {
        role: "user",
        content: "Hello"
      }
    ]);

  res.json(response);
});

module.exports = router;