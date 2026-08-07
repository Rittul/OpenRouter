const express =require("express");
const app= express();
require('dotenv').config();
const cors=require("cors");
const cookieParser = require("cookie-parser");
const prisma = require("./config/prisma");

const allowedOrigins = [
  "http://localhost:5173",
  "https://opnrouterai.netlify.app"
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/",(req,res)=>{
    res.send("backend running!");
});


app.get("/health", async (req, res) => {
  console.log("Health endpoint hit");

  try {
    await prisma.$queryRaw`SELECT 1`;

    console.log("Database OK");

    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Health error:", err);

    res.status(500).json({
      status: "error",
      error: err.message,
    });
  }
});

const authRouter= require("./routes/auth");
const profileRouter=require("./routes/profile");
const apiRouter=require("./routes/apikey");
const chatRouter =require("./routes/chat");
const conversationroute=require("./routes/conversation");
const modelrouter=require("./routes/model");
const apichatRouter = require("./routes/apiroute");
const paymentRouter = require("./routes/payment");

app.use("/v1", apichatRouter);
app.use("/chat", chatRouter);
app.use("/",conversationroute);
app.use("/",authRouter);
app.use("/",profileRouter);
app.use("/",apiRouter);
app.use("/",modelrouter);
app.use("/",paymentRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT,(req,res)=>{
    console.log(`server listening on port ${PORT}`);
})
