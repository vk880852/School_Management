import { Router } from "express";
import {
    Registerowner,
    loginUser,
    logoutUser,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
} from '../Controller/owner.controller.js'
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {upload} from '../middlewares/multer.middleware.js'
const router=Router();

router.post('/register', upload.fields([
    { name: 'avatar', maxCount: 1 },
   
]), Registerowner);

router.post('/login', loginUser);

router.post('/logout', verifyJWT, logoutUser);

router.put('/change-password',verifyJWT, changeCurrentPassword);

router.get('/me',verifyJWT, getCurrentUser);

router.put('/update',verifyJWT, updateAccountDetails);

router.put('/update-avatar',verifyJWT, upload.fields([
    { name: 'avatar', maxCount: 1 }]), updateUserAvatar);

export default router;