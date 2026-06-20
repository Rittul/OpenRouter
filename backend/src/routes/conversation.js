const express= require("express");
const conversationRouter=express.Router();
const userauth=require("../middleware/auth");
const prisma = require("../config/prisma");

conversationRouter.post("/createconvo",userauth,async(req,res)=>{
    try{
        const userid=req.user;  // in midlleware i have attached userid in req.user 
        const convo=await prisma.conversation.create({
            data:{
                user_id:userid
            }
        });
        return res.json({message:"conversation created",convo})
    }catch(err){
        console.log(err);
        res.status(500).json({
        message: "Internal server error"
        });
    }
});

conversationRouter.delete("/deleteconvo/:id",userauth,async (req, res) => {
    try {

      const id = parseInt(req.params.id);

      const userid = req.user;

      // check ownership
      const conversation =
        await prisma.conversation.findFirst({
          where: {
            id,
            user_id: userid
          }
        });

      if (!conversation) {
        return res.status(404).json({
          message: "Conversation not found"
        });
      }

      await prisma.conversation.delete({
        where: {
          id
        }
      });

      return res.json({
        message: "Conversation deleted"
      });

    } catch (err) {

      console.log(err);

      res.status(500).json({
        message: "Internal server error"
      });
    }
});


module.exports =conversationRouter;