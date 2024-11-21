import mongoose, { Schema } from "mongoose";

const teacherSchema = new Schema({
  name: {
    type: String,
    required: true, 
    type:String,
    trim:true,
    index:true
  },
  email: {
    type: String,
    required: true, 
    unique:true,
    lowercase:true,
    trim:true,
  },
  subject: {
    type: String,
    required: true, 
    trim:true,
  },
  profileImageUrl: {
    type: String,  
    required:true,
  },
  owner:
  {
    type:Schema.Types.ObjectID,
    ref:"Owner",
  },
  createdAt: {
    type: Date,
    default: Date.now, 
  }
}, {
  timestamps: true,  
});


const Teacher = mongoose.model("Teacher", teacherSchema);

export default Teacher;
