import mongoose, { isValidObjectId } from 'mongoose';
import Student from '../models/student.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { deleteOnCloudinary, uploadOnCloudinary } from '../utils/uploadOnCloudinary.js';
import { ApiError } from '../utils/apiError.js';
const Registerowner=asyncHandler(async(req,res)=>{
    const {name,email}=req.body;
    console.log(name,email);
    if([name,email].some((x)=>(x?.trim()==="")))
    {
        throw new ApiError(400,"All Fields are required");
    }
    if(await Student.findOne({$or:[{email}]}))
    {
        throw new ApiError(409, "email already exists");
    }
    const avatarPath=req.file.path||"";
    if(!avatarPath)
    {
        throw new ApiError(400,"please upload image");
    }
    const uploadAvatar=avatarPath?uploadOnCloudinary(avatarPath):"";
    if(!uploadAvatar)
    {
        throw new ApiError(402,"image is required");
    }
    const newStudent=await Student.create({
        name:name,
        email:email,
        profileImageUrl:uploadAvatar.url,
        owner:req.user._id
    })
    if (!newStudent) {
        throw new ApiError(500, "Error creating newStudent Profile");
    }
    const createdStudent = await Student.findById(newStudent._id);
    return res.status(201).json(new ApiResponse(200,"Student registered successfully",createdStudent));

})
const getAllStudent=asyncHandler(async(req,res)=>{
     
    let { page = 1, limit = 10 } = req.query;

    const allStudent=await Student.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(req.user._id),
            }
        },
        {
            $facet:{
                data:[
                    {
                        $skip:(page-1)*limit,
                   },
                   {
                    $limit:limit
                    },
                ],
                totalCount:[
                    {
                        $count:"total"
                    },
                ]
            }
        }

    ])
    res.status(200).json(new ApiResponse(200,"All students list fetched",allStudent[0]));
})
const getStudentById = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const student = await Student.findById(studentId);
    if (!student) {
      throw new ApiError(404, 'Student not found');
    } 
    return res.status(200).json(new ApiResponse(200,"Successfully retrive",student));
  });
  const updateStudent = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const { name, classId } = req.body;

    // if (!name.trim() || !isValidObjectId(classId)) {
    //     throw new ApiError(300, "Either name is required or ClassId is not valid");
    // }

    const student = await Student.findById(studentId);
    if (!student) {
        throw new ApiError(404, 'Student not found');
    }

    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    const oldAvatar = student.profileImageUrl;
    if (oldAvatar) {
        const avatarParts = oldAvatar.split("/");
        const publicIdAvatar = avatarParts[avatarParts.length - 1].split(".")[0];
        await deleteOnCloudinary(publicIdAvatar);
        
        await Student.findByIdAndUpdate(studentId, {
            $unset: { profileImageUrl: ""}
        });
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading avatar");
    }
    if(name.trim()!==null)
    student.name = name;
    if(isValidObjectId(classId))
    student.class = classId;
    student.profileImageUrl = avatar.url;

    await student.save();

    res.status(200).json(new ApiResponse(200, 'Student updated successfully', student));
});

const deleteStudent = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const student = await Student.findById(studentId);

    if (!student) {
        return res.status(404).json(new ApiResponse(404, "Student not found"));
    }
    // Soft delete by updating the deletedAt field
    const options = { validateBeforeSave: false };
     const deleted=await Student.softDelete({_id:studentId},options);
    return res.status(200).json(new ApiResponse(200, "Deleted Successfully",deleted));
});

  
export{
    Registerowner,
    getAllStudent,
    getStudentById,
    updateStudent,
    deleteStudent
}