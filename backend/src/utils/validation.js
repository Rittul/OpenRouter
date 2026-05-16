const express = require("express");
const validator=require("validator")

const validatesignupdata =(req)=>{
    const {email,password} = req.body;
    if(!email || !password) throw new Error("All fields required");
    if(!validator.isEmail(email)) throw new Error("Enter valid email");
    if(!validator.isStrongPassword(password)) throw new Error("Enter strong password");
}

module.exports = validatesignupdata;
