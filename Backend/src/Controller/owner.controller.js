import { asyncHandler } from "../utils/asyncHandler.js";
import { Owner } from "../models/owner.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/uploadOnCloudinary.js";

const generateAccesstoken=async(userId)=>{
try {
        const exitUser=await Owner.findById(userId);
        const accessToken=await exitUser.generateAccessToken();
        user.accessToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return {accessToken}
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
    if(await Owner.findOne({$or:[username,email]}))
    {
        throw new ApiError(409, "Username or email already exists");
    }
    const avatarPath=req.files?.avatar?.[0]?.path||"";
    const uploadAvatar=avatarPath?uploadOnCloudinary(avatarPath):"";
    if(!uploadAvatar)
    {
        throw new ApiError(402,"image is required");
    }
    const newOwner=await Owner.create({
        username:username,
        email:email,
        fullname:fullname,
        password:firstPassword,
        avatar:uploadAvatar
    })
    if (!newOwner) {
        throw new ApiError(500, "Error creating user");
    }
    const createdOwner = await User.findById(newOwner._id).select("-password -refreshtoken");
    return res.status(201).json(new ApiResponse(200,"User registered successfully",createdOwner));

})
const loginUser=asyncHandler(async(req,res)=>{
    const {username,email,password}=req.body;
    if(!email)
    {
        throw new ApiError(400,"email is required");
    }
    if(!password)
    {
        throw new ApiError(400,"password is required");
    }
    const exitUser=await Owner.findOne({$or:[username,email]});
    if(!exitUser)
    {
        throw new ApiError(400,"user does not exist");
    }
    const isPassword=Owner.isPassword(password);
    if(!isPassword)
    {
        console.log("password is not correct")
        throw new ApiError(201,"password is not correct");
    }
    const loggedInUser = await Owner.findById(exitUser._id).select("-password accesstoken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

    
})
const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
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
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})
const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body

    const user = await Owner.findById(req.user?._id)
    const isPasswordCorrect = await Owner.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
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
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }
    const oldAvatar = req.user.avatar;
    const avatarh = oldAvatar.split("/");
    const publicIdavatar= avatarh[avatarh.length - 1].split(".")[0];
    deleteOnCloudinary(publicIdavatar);
    const avatar =  uploadOnCloudinary(avatarLocalPath)
    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const user = await Owner.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password -accesstoken")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar image updated successfully")
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
