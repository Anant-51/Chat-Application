import { Router } from "express";
const router = Router();
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
router.use(cookieParser());
router.post("/signup",async(req,res)=>{
    try{
    const {username,email,password}=req.body;
    const userExists=await User.findOne({email});
    if(userExists){
        return res.status(400).json({message:"user already exists"});

    }
    const newUser=new User({
        username,email,password
    })
    await newUser.save();
    const token=jwt.sign({id:newUser._id,username},process.env.JWT_SECRET,{expiresIn:"1d"});
    res.cookie("token",token,{httpOnly:true});
    res.status(200).json({
        message:"User created successfully",
        user:{
            id:newUser._id,
            username:newUser.username,
            email:newUser.email
        }
    })


}catch(err){
    console.log("error in signingup",err);
    res.status(500).json({message:"internal server error",error: err.message});
}

})
router.post("/signin",async(req,res)=>{
    try{
        const {username,email,password}=req.body;
        const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"user not exists"});

        }
        const correct=await user.comparepassword(password);
        if(!correct){
            return res.status(400).json({message:"error during signin"});

        }
        const token=jwt.sign({
            id:user._id,
            username:user.username
        },process.env.JWT_SECRET,{expiresIn:"1d"});
        res.cookie("token",token);
        res.status(200).json({
            message:"Signed in succesful",
            user:{
                id:user._id,
                username:user.username,
                email:user.email
            }
        })
    }
    catch(err){
        console.log("error signing in",err);
        res.status(500).json({message:"error signing in",error: err.message});
    }
})

router.post("/signout",async(req,res)=>{
    try{
        res.clearCookie("token");
        res.status(200).json({message:"Signed out successfully"});
    }
    catch(err){
        console.log("error signing out",err);
        res.status(500).json({message:"error signing out"});
    }
})
export default router;