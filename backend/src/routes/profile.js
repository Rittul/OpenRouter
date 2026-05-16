const express= require("express");
const profileRouter=express.Router();
const userauth=require("../middleware/auth");
const prisma = require("../config/prisma");

profileRouter.get("/profile",userauth,async(req,res)=>{
    try{
        const userid=req.user;
        const user=await prisma.user.findUnique({
            where:{
                id:userid
            },
            select: {
                email: true
            }
        });
        const name=user.email.split("@")[0];
        const apikeys= await prisma.apiKey.findMany({
            where:{
                user_id:userid
            },
            select:{
                name:true,
                key_hash:true,
                disabled:true,
                last_used_at:true
            }
        });

        const credit=await prisma.credit.findUnique({
            where:{
                user_id:userid
            },
            select:{
                balance:true
            }
        });
        const userdetails={
            name,
            apikeys,
            balance:credit.balance
        };
        return res.json({userdetails});
    }catch(err){
        console.log(err);
        res.status(500).json({
        message: "Internal server error"
        });
    }
})


module.exports=profileRouter;
