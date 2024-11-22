import Class from '../models/class.model.js'
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js'


const registerClass = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name.trim()) {
    throw new ApiError(400, "Class name is required"); 
  }
  const createClass = await Class.create({
    name,
    owner: req.user._id, 
  });

  res.status(201).json(new ApiResponse(201,"Class created successfully",createClass));
});
const getAllClass=asyncHandler(async(req,res)=>{
     const {page=1,limit=10}=req.query;
     const totalClass=await Class.aggregate([
      { $skip: (page-1)*limit },    
      { $limit: pageLimit },
      { $sort: { createdAt: -1 } }
     ])
     return res.status(201).json(new ApiResponse(201,"fetched successfully",totalClass));
})
const assignTeacherToClass = async (req, res) => {
  try {
    const { classId, teacherId } = req.body;
    const updatedClass = await Class.findByIdAndUpdate(classId, { teacherId }, { new: true });
    if (!updatedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.status(200).json(new ApiResponse(200,'Teacher assigned successfully',updatedClass ));
  } catch (err) {
    res.status(500).json(new ApiResponse(500,'Error assigning teacher', err.message ));
  }
};
const updateClass = async (req, res) => {
  try {
    const { classId, name, teacherId } = req.body;

    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      { name, teacherId },
      { new: true }
    );

    if (!updatedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.status(200).json(new ApiResponse( 200, 'Class updated successfully', updatedClass ));
  } catch (err) {
    res.status(500).json(new ApiResponse( 500, 'Error updating class', err.message ));
  }
};
const deleteClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const deletedClass = await Class.findByIdAndDelete(classId);
    if (!deletedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.status(200).json(new ApiResponse(200,'Class deleted successfully',deleteClass ));
  } catch (err) {
    res.status(500).json(new ApiResponse(500,'Error deleting class', err.message ));
  }
};


export {
  registerClass,
  assignTeacherToClass,
  updateClass,
  deleteClass,
  getAllClass
}