import {asyncHandler} from '../utils/asyncHandler.js'
const uploadOnCloudinary=asyncHandler(async(file)=>{
       try{
        if(!file)
        {
            throw new ApiError(402,"File_url is missing")
        }
        const res=await cloudinary.v2.uploader
            .upload(file,{
                resource_type:'auto'
            })
            await fs.unlinkSync(file);
            return res;
            
       }
       catch(error)
       {
        await fs.unlinkSync(localpath);
        //if uplaod is failed
        return null
       }
})
const deleteOnCloudinary=asyncHandler(async(file)=>{
    try{
        await cloudinary.uploader.destroy(file,{ type: 'upload', resource_type: 'auto' });
     }
     catch(error)
     {
       throw new ApiError("failed during deletion",error);
     }

})
export {uploadOnCloudinary,deleteOnCloudinary};