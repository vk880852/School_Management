import mongoose, { Schema } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const classSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  teacher: {
    type: Schema.Types.ObjectId,
    ref: 'Teacher', 
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'Owner',
  },
  studentCount: {
    type: Number,
    default: 0, 
  }
}, {
  timestamps: true, 
});

classSchema.plugin(mongooseAggregatePaginate);

const Class = mongoose.model('Class', classSchema);

export default Class;
