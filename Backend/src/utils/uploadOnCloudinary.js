import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'
import dotenv from 'dotenv';
dotenv.config({});
// console.log('Cloudinary Config:');
// console.log('Cloud Name:', process.env.CLOUD_NAME);
// console.log('API Key:', process.env.API_KEY);
// console.log('API Secret:', process.env.API_SECRET);
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET
  });
  const uploadOnCloudinary=async(localpath)=>{
    try{
         if(!localpath)return null;
         console.log("this is localpath",localpath)
            const res=  await cloudinary.uploader.upload(localpath,{
            resource_type:'auto'
         })
         await fs.unlinkSync(localpath);
         return res; 
    }
    catch(error)
    {
        await fs.unlinkSync(localpath);
        console.log("something went wrong while uploading on cloudinary",error);
        return null
    }
}
const deleteOnCloudinary=async(localpath)=>{
  try{
     await cloudinary.uploader.destroy(localpath,{ type: 'upload', resource_type: 'auto' });
  }
  catch(error)
  {
    throw new ApiError("failed during deletion",error);
  }
}


export { uploadOnCloudinary,deleteOnCloudinary};