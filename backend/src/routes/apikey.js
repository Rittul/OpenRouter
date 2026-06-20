const express= require("express");
const apiRouter=express.Router();
const userauth=require("../middleware/auth");
const prisma = require("../config/prisma");
const jwt = require("jsonwebtoken");

const getapikey=()=>{
    const randomKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const key_hash = "sh-o3-"+jwt.sign({key: randomKey}, process.env.JWT_SECRET, {expiresIn: "365d"});
    return key_hash;
}



apiRouter.post("/api-key/create",userauth,async(req,res)=>{
    try{
        const userid=req.user;
        const {name}=req.body;
        const ispresent=await prisma.apiKey.findFirst({
            where:{
                user_id:userid,
                name
            }
        });
        if(ispresent) return res.status(400).send("This name alreday exist choose something else");
        const key_hash=getapikey();
        const newkey= await prisma.apiKey.create({
            data:{
                user_id:userid,
                name,
                key_hash
            }
        });
        res.json({message:"api-key created successfully"},newkey);
    }catch(err){
        console.log(err);
        res.status(500).json({
        message: "Internal server error"
        });
    }
});

apiRouter.post("/api-key/:id/:status",userauth,async(req,res)=>{
    try{
        const status = req.params.status === "true";
        const id = parseInt(req.params.id);
        const isupdate=await prisma.apiKey.update({
            where:{ id },
            data:{
                disabled: status
            }
        });
        if(isupdate) return res.json({message:"api-key status changed successfully"});
        else return res.status(500).json({
        message: "something went wrong"
        });
    }catch(err){
        console.log(err);
        res.status(500).json({
        message: "Internal server error"
        });
    }
})

module.exports =apiRouter;