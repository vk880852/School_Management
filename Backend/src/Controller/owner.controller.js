import { asyncHandler } from "../utils/asyncHandler.js";
import { Owner } from "../models/owner.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary,deleteOnCloudinary } from "../utils/uploadOnCloudinary.js";
import { ApiError } from "../utils/apiError.js";

const generateAccesstoken=async(user)=>{
try {
        const accesstoken=await user.generateAccessToken();
        user.accesstoken = accesstoken;
        await user.save({ validateBeforeSave: false })
        return {accesstoken}
} catch (error) {
    console.log('Something went wrong while generating access token');
    throw new ApiError(500, "Something went wrong while generating referesh and access token")
}
}
const Registerowner=asyncHandler(async(req,res)=>{
    const {username,email,fullname,firstPassword,finalPassword}=req.body;
    if([username,email,fullname,firstPassword,finalPassword].some((x)=>(x?.trim()==="")))
    {
        throw new ApiError(400,"All Fields are required");
    }

    if(firstPassword!==finalPassword)
    {
        throw new ApiError(203,"both password should be same");
    }
    if (await Owner.findOne({ $or: [{ username }, { email }] })) {
        throw new ApiError(409, "Username or email already exists");
    }
    const avatarPath = req.files?.avatar?.[0]?.path||"";
    if(!avatarPath)
    {
        throw new ApiError(400, "Avatar file is required");
    }
    const uploadAvatar=await uploadOnCloudinary(avatarPath);
    if(!uploadAvatar)
    {
        throw new ApiError(402,"image is required");
    }
    const newOwner=await Owner.create({
        username:username,
        email:email,
        fullname:fullname,
        password:firstPassword,
        avatar:uploadAvatar?.url||""
    })
    if (!newOwner) {
        throw new ApiError(500, "Error creating user");
    }
    const createdOwner = await Owner.findById(newOwner._id).select("-password -accesstoken");
    return res.status(201).json(new ApiResponse(200,"User registered successfully",createdOwner));

})
const loginUser=asyncHandler(async(req,res)=>{
    const {username,email,password}=req.body;
     if(!(username||email))
        {
         throw new ApiError(400,"username and password is required");
        }
        const isUser=await Owner.findOne({$or:[{username},{email}]});
        if(!isUser)
        {
            throw new ApiError(400,"user does not exist");
        }
  
    if(!password)
    {
        throw new ApiError(400,"password is required");
    }

    const isPassword=await isUser.isPasswordCorrect(password);
    if(!isPassword)
    {
        console.log("password is not correct")
        throw new ApiError(201,"password is not correct");
    }
    const {accesstoken}=await generateAccesstoken(isUser);

    const loggedInUser = await Owner.findById(isUser._id).select("-password -accesstoken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accesstoken", accesstoken, options)
    .json(
        new ApiResponse(
            200, 
              "User logged In Successfully",
            {
                user: loggedInUser
            }
        )
    )

    
})
const logoutUser=asyncHandler(async(req,res)=>{
    await Owner.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                accesstoken: 1 
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200,"User logged Out",{}))
})
const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body

    const user = await Owner.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})
    const newUser=await Owner.findById(req.user._id).select("-accesstoken -password -avatar");
    return res
    .status(200)
    .json(new ApiResponse(200, "Password changed successfully",newUser))
})
const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "User fetched successfully"
    ))
})
const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullName, email} = req.body

    console.log({fullName, email});
    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await Owner.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email
            }
        },
        {new: true}
        
    ).select("-password -accesstoken")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
});

const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.files?.avatar?.[0]?.path
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }
   

    const oldAvatar = req.user.avatar;
    const avatarh = oldAvatar.split("/");
    const publicId= avatarh[avatarh.length - 1].split(".")[0];
    if(publicId)
    {
      const result=await deleteOnCloudinary(publicId);
      if(result==='ok')
      {
         await Owner.findByIdAndUpdate(req.user?._id,{
            $unset:{
                avatar:1
            }
         })
      }
    }
    const avatar1 = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar1||!avatar1.url) {
        throw new ApiError(400,"Error while uploading new Avatar");
    }

    const user = await Owner.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar1.url
            }
        },
        {new: true}
    ).select("-password -accesstoken")

    return res
    .status(200)
    .json(
        new ApiResponse(200,"Avatar image updated successfully",user)
    )
})

export{
    Registerowner,
    loginUser,
    logoutUser,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
}
