const prisma = require("../config/prisma");

const apiauth=async(req,res,next)=>{
    try{
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "API key required"
        });
        }
    const apiKey = authHeader.split(" ")[1];
       const api = await prisma.apiKey.findFirst({
            where: {
                key_hash: apiKey,
                disabled: false
            }
        });
        if(!api)return res.status(401).send("Invalid api key!");
        req.user = api.user_id;
        req.apiKeyId = api.id;
        next();
    }catch(err){
        res.status(401).send(err.message);
    }
}

module.exports = apiauth;