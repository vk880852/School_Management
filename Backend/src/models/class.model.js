import mongoose, { Schema } from 'mongoose';

const classSchema = new Schema({
  name: {
    type: String,  
    required: true 
  },
  teacher:{
       type:Schema.Types.Object.Id,
       ref:"teacher"
  },
  owner:
  {
    type:Schema.Types.ObjectID,
    ref:"Owner",
  },
  studentCount:{
     type:Number,
     default:0
  }
}, {
  timestamps: true
});

const Class = mongoose.model('Class', classSchema); 

export default Class;
