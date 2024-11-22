import {asyncHandler} from "../utils/asyncHandler.js";
import jwt  from "jsonwebtoken";
import { ApiError } from "../utils/apiError.js";
import { Owner } from "../models/owner.model.js";
export const verifyJWT=asyncHandler(async(req,res,next)=>{
      const token = (req.cookies?.accesstoken) || req.headers?.authorization?.replace("Bearer ","")
      if(!token)
      {
        throw new ApiError(401,"Unauthorised token");
      }
      try{
           const decodedToken= jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
           const user=await Owner.findById(decodedToken._id).select("-password -accesstoken");
           if(!user)
           {
            throw new ApiError(401,"invalid access Token");
           }
           req.user=user;
           next();
      }
      catch(error)
      {
            throw new ApiError(401,error?.message||"invalid access token");
      }
});