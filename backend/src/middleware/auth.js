const jwt=require("jsonwebtoken")

const userauth=(req,res,next)=>{
    try{
        const token =req.cookies.token;
        if(!token){
            return res.status(400).send("no token found! pls login first");
        }
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        req.user=decoded.userId;
        next();
    }catch(err){
        res.status(401).send(err.message);
    }
}

module.exports=userauth;