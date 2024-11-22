import mongoose from "mongoose";
import Teacher from "../models/teacher.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/uploadOnCloudinary.js";


const getAllTeacher = asyncHandler(async (req, res) => {
    const { page = 1, limit = 1 } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    const result = await Teacher.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user._id),
            }
        },
        {
            $facet: {
                data: [
                    { $skip: (pageNumber - 1) * limitNumber }, 
                    { $limit: limitNumber }, 
                ],
                totalCount: [
                    { $count: "total" }, 
                ],
            },
        },
    ]);

    const teachers = result[0].data;
    const totalTeachers = result[0].totalCount.length > 0 ? result[0].totalCount[0].total : 0;

    return res.status(200).json(new ApiResponse(200, "All data are fetched", { teachers, totalTeachers }));
});

const registerTeacher=asyncHandler(async(req,res)=>{
    const {name,email,subject}=req.body;
    if([name,email,subject].some((x)=>(x?.trim()==="")))
    {
        throw new ApiError(500,"All Fields are required");
    }
    const existTeacher=await Teacher.findOne({email});
    if(existTeacher)
    {
        throw new ApiError(402,"this email is already exist");
    }
    const avatarPath=req.files?.avatar?.[0]?.path||"";
    const uploadAvatar=avatarPath?await uploadOnCloudinary(avatarPath):"";
    if(!uploadAvatar)
    {
        throw new ApiError(402,"image is required");
    }
    console.log(uploadAvatar);
    const newTeacher=await Teacher.create({
        name:name,
        email:email,
        subject:subject,
        profileImageUrl:uploadAvatar.url,
        owner:req.user._id
    })
    if (!newTeacher) {
        throw new ApiError(500, "Error creating ");
    }
    const createdTeacher = await Teacher.findById(newTeacher._id);
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

    

    const existTeacher = await Teacher.findById(teacherId);
    if (!existTeacher) {
        throw new ApiError(404, "Teacher does not exist");
    }
    const name1=name?name:Teacher.name;
    const subject1=subject?subject:Teacher.subject;
    const updatedTeacher = await Teacher.findByIdAndUpdate(
        teacherId,
        { name:name1, subject:subject1 },
        { new: true } 
    );

    res.status(200).json({
        message: "Teacher details updated successfully",
        teacher: updatedTeacher,
    });
});
const updateprofileImageUrl = asyncHandler(async (req, res) => {
    const { teacherId } = req.params;
    console.log(req.file);
    const avatarLocalPath = req.file.path; 
    const existTeacher = await Teacher.findById(teacherId);
    if (!existTeacher) {
        throw new ApiError(404, "Teacher does not exist");
    }

    if (existTeacher.profileImageUrl) {
        const avatarPathParts = existTeacher.profileImageUrl.split("/");
        const publicIdavatar = avatarPathParts[avatarPathParts.length - 1].split(".")[0];
        await deleteOnCloudinary(publicIdavatar); 
        await Teacher.findByIdAndUpdate(teacherId,{
            $unset:{
                profileImageUrl:1
            }
        }

        )
    }
    const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath); 
    existTeacher.profileImageUrl = uploadedAvatar.url; 
    await existTeacher.save();

    res.status(200).json(new ApiResponse(200,
         "Profile image updated successfully",
        existTeacher,
    ));
});
const deleteTeacherProfile = asyncHandler(async (req, res) => {
    const { teacherId } = req.params;
    
    const teacher = await Teacher.findById(teacherId);
    
    if (!teacher) {
      return res.status(404).json(new ApiResponse(404, "Teacher not found"));
    }
  
    await teacher.softDelete();
    
    return res.status(200).json(new ApiResponse(200, "Deleted Successfully"));
  });
  

export{updateprofileImageUrl,updateAccountDetails,getTeacher,getAllTeacher,registerTeacher,deleteTeacherProfile}