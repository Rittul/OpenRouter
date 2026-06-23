const express= require("express");
const modelrouter=express.Router();
const userauth=require("../middleware/auth");
const prisma = require("../config/prisma");

modelrouter.get("/models",userauth,async(req,res)=>{
    try{
        const models=await prisma.model.findMany();
        res.status(200).json({models,});
    }catch(err){
        console.log(err);
        res.status(500).json({
        message: "Internal server error"
        });
    }
})

module.exports = modelrouter;