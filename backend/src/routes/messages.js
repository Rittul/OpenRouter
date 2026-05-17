const express= require("express");
const messageRouter=express.Router();
const userauth=require("../middleware/auth");
const prisma = require("../config/prisma");

messageRouter.post("/createmessage",userauth,async (req, res) => {
    try {

      const userid = req.user;

      const {
        conversationId,
        content
      } = req.body;

      // check conversation ownership
      const conversation =
        await prisma.conversation.findFirst({
          where:{
            id: conversationId,
            user_id: userid
          }
        });

      if (!conversation) {
        return res.status(404).json({
          message: "Conversation not found"
        });
      }
      if (!content) {
        return res.status(400).json({
            message:"Content required"
        });
    }

      // save user message
      const message =
        await prisma.message.create({
          data:{
            conversation_id: conversationId,
            role: "user",
            content: content
          }
        });

      return res.json({
        message
      });

    } catch(err){

      console.log(err);

      res.status(500).json({
        message: "Internal server error"
      });
    }
});

messageRouter.get("/getmessages/:id",userauth,async(req,res)=>{
    try{
        const userid=req.user;
        const conversationId = parseInt(req.params.id);
        const conversation =
        await prisma.conversation.findFirst({
          where:{
            id: conversationId,
            user_id: userid
          }
        });

      if (!conversation) {
        return res.status(404).json({
          message: "Conversation not found"
        });
      }

      const response=await prisma.message.findMany({
            where:{
                conversation_id:conversationId
            },
            orderBy:{
                created_at:"asc"
            }
      });
      return res.json({response});
    }catch(err){
        console.log(err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
})