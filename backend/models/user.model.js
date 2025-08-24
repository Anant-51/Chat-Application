import mongoose from "mongoose";
import bcrypt from "bcrypt";
const userschema= new mongoose.Schema({
    username:{
        type:String,
        required:true,

    },email:{
        type:String,
        required:true,
        unique:true

    },
    password:{
        type:String,
        required:true
    },
    profile:{
        type:String,
        default:`http://localhost:${process.env.PORT}/static/profileImage.png`

    },isOnline:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true
});


userschema.pre("save",async function(next){
    if(!this.isModified("password")){
        return next();
    }
    try{
    const hashedpassword=await bcrypt.hash(this.password,10);
    this.password=hashedpassword;
    next();
    }
    catch(err){
        console.log("error hashing password",err);
    
    }
       
});
userschema.methods.comparepassword=async function(candidatePassword){
    try{
    return  bcrypt.compare(candidatePassword,this.password);
    }catch(err){
      throw new Error("Error comparing passwords: " + err.message);
    }
}

const User=mongoose.model("User",userschema);

export default User;
