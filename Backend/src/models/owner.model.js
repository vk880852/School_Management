import mongoose, {Schema} from "mongoose";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
const ownerSchema=new Schema 
(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true,
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
        },
        fullname:{
            type:String,
            required:true,
            trim:true,
            index:true
        },
        avatar:{
            type:String,
            required:true,
            
        },
    
        password:{
            type:String,
            required:[true,"password is required"]
        },
        accesstoken:{
           type:String,
        }
    },
    {timestamps:true}
);
ownerSchema.pre("save",async function(next){
    if(!this.isModified("password"))return next();
    this.password=await bcrypt.hash(this.password,15);
    next();
})
ownerSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password)
}
ownerSchema.methods.generateAccessToken=function()
{
    return jwt.sign({
        _id:this._id,
         fullname:this.fullname,
         email:this.email,
         username:this.username
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    })
}

export const Owner=mongoose.model("Owner",ownerSchema);