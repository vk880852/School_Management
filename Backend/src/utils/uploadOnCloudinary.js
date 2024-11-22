import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'
import dotenv from 'dotenv';
import { ApiError } from './apiError.js';
dotenv.config({});

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET
  });
  const uploadOnCloudinary=async(localpath)=>{
    try{
         if(!localpath)return null;
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
const deleteOnCloudinary = async (publicId) => {
  try {
    if (!publicId) {
      throw new Error('Public ID is required to delete the file');
    }    
    const result = await cloudinary.uploader.destroy(publicId, { type: 'upload', resource_type: 'image' });
    if (result.result !== 'ok') {
      throw new Error(`Failed to delete the file: ${result.error.message || result.result}`);
    }

    return result;

  } catch (error) {
    console.error(`Failed to delete file from Cloudinary: ${error.message}`);
    
    throw new ApiError(401, `Failed to delete file: ${error.message}`);
  }
};



export { uploadOnCloudinary,deleteOnCloudinary};