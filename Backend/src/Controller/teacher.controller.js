import Teacher from "../models/student.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteOnCloudinary } from "../utils/uploadOnCloudinary.js";


const getAllTeacher=asyncHandler(async(req,res)=>{

})
const registerTeacher=asyncHandler(async(req,res)=>{
    const {name,email,subject}=req.body;
    if([name,email,subject,profileImageUrl].some((x)=>(x?.trim()==="")))
    {
        throw new ApiError(500,"All Fields are required");
    }
    const existTeacher=await Teacher.findOne({email});
    if(existTeacher)
    {
        throw new ApiError(402,"this email is already exist");
    }
    const avatarPath=req.files?.avatar?.[0]?.path||"";
    const uploadAvatar=avatarPath?uploadOnCloudinary(avatarPath):"";
    if(!uploadAvatar)
    {
        throw new ApiError(402,"image is required");
    }
    const newTeacher=await Owner.create({
        name:name,
        email:email,
        subject:subject,
        profileImageUrl:uploadAvatar,
        owner:req.user._id
    })
    if (!newTeacher) {
        throw new ApiError(500, "Error creating ");
    }
    const createdTeacher = await User.findById(newTeacher._id);
    return res.status(201).json(new ApiResponse(200,"Teacher registered successfully",createdTeacher));

})
const getTeacher=asyncHandler(async(req,res)=>{
    const {teacherId}=req.params;
    const existTeacher=await Teacher.findById(teacherId);
    if(!existTeacher)
    {
        return new ApiResponse(201,"Teacher does not exist",existTeacher);
    }
    return res.status(201).json(new ApiResponse(201,"Teacher fetched Successfully",existTeacher));
})
const updateAccountDetails = asyncHandler(async (req, res) => {
    const { name, subject } = req.body;
    const { teacherId } = req.params;

    if ([name, subject].some((x) => x.trim() === "")) {
        throw new ApiError(400, "Fill All information"); 
    }

    const existTeacher = await Teacher.findById(teacherId);
    if (!existTeacher) {
        throw new ApiError(404, "Teacher does not exist");
    }

    const updatedTeacher = await Teacher.findByIdAndUpdate(
        teacherId,
        { name, subject },
        { new: true } 
    );

    res.status(200).json({
        message: "Teacher details updated successfully",
        teacher: updatedTeacher,
    });
});
const updateprofileImageUrl = asyncHandler(async (req, res) => {
    const { teacherId } = req.params;
    const avatarLocalPath = req.file.path; // Assuming you're using multer for file upload and it's accessible here

    // Check if the teacher exists
    const existTeacher = await Teacher.findById(teacherId);
    if (!existTeacher) {
        throw new ApiError(404, "Teacher does not exist");
    }

    if (existTeacher.profileImageUrl) {
        const avatarPathParts = existTeacher.profileImageUrl.split("/");
        const publicIdavatar = avatarPathParts[avatarPathParts.length - 1].split(".")[0];
        await deleteOnCloudinary(publicIdavatar); 
    }

    const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath); // Make sure this function is asynchronous

    existTeacher.profileImageUrl = uploadedAvatar.secure_url; 
    await existTeacher.save();

    res.status(200).json({
        message: "Profile image updated successfully",
        teacher: existTeacher,
    });
});

export{updateprofileImageUrl,updateAccountDetails,getTeacher,registerTeacher}