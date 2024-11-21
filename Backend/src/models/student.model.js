import mongoose, { Schema } from "mongoose";

const studentSchema = new Schema({
  name: {
    type: String,
    required: true, 
  },
  email: {
    type: String,
    required: true, 
    unique: true,  
    lowercase:true,
    trim:true,
  },
  class: {
    type: Schema.Types.ObjectId,
    ref:"Class"
  },
  profileImageUrl: {
    type: String,  
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


const Student = mongoose.model("Student", studentSchema);

export default Teacher;
