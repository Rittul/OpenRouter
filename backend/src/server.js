const express =require("express");
const app= express();
require('dotenv').config();
const cors=require("cors");
const cookieParser = require("cookie-parser");

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.get("/",(req,res)=>{
    res.send("backend running!");
})

const authRouter= require("./routes/auth");
const profileRouter=require("./routes/profile");
const apiRouter=require("./routes/apikey");
const chatRouter =require("./routes/chat");
const conversationroute=require("./routes/conversation");
const modelrouter=require("./routes/model");

app.use("/chat", chatRouter);
app.use("/",conversationroute);
app.use("/",authRouter);
app.use("/",profileRouter);
app.use("/",apiRouter);
app.use("/",modelrouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT,(req,res)=>{
    console.log(`server listening on port ${PORT}`);
})
