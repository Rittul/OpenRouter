const express= require("express");
const authRouter=express.Router();
const jwt=require("jsonwebtoken");
const bcrypt=require("bcrypt");
const prisma = require("../config/prisma");
const validatesignupdata= require("../utils/validation");

authRouter.post("/signup",async(req,res)=>{
    try{
        validatesignupdata(req);
        const {email,password}=req.body;
        const existinguser=await prisma.user.findUnique({
            where:{
                email
            }
        })
        if(existinguser) return res.status(400).json({
        message: "User already exists"
      });
      const hashedpassword=await bcrypt.hash(password,10);
      const user= await prisma.user.create({
        data:{
            email,
            password_hash: hashedpassword
        }
      });
      await prisma.credit.create({
            data:{
                user_id:user.id,
                balance:1000
            }
      });
      const token =jwt.sign({userId:user.id},process.env.JWT_SECRET,{expiresIn:"1d"});
      res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Lax"
        });
      res.status(201).json({
      message: "Signup successful",
      token
    });
    }catch(err){
        console.log(err.message);
        res.send(err.message);
    }
})


authRouter.post("/login", async (req, res) => {

  try {

    const { email, password } = req.body;

    // validation
    if (!email || !password) {
      return res.status(400).json({
        message: "All fields required"
      });
    }

    // find user
    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (!user) {
      return res.status(400).json({
        message: "No user found"
      });
    }

    // compare password
    const isMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    // create token
    const token = jwt.sign(
      {
        userId: user.id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax"
    });
    res.status(200).json({
      message: "Login successful",
      token
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Internal server error"
    });
  }
});

authRouter.post("/logout", (req, res) => {
  res.clearCookie("token");  
  res.status(200).json({
    message: "Logout successful"
  });

});


module.exports=authRouter;