import { Router } from 'express';
import {
    registerTeacher,
    getAllTeacher,
    getTeacher,
    updateAccountDetails,
    updateprofileImageUrl
} from '../Controller/teacher.controller.js'
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyJWT);

router.post('/teachers', upload.fields([{ name: 'avatar', maxCount: 1 }]), registerTeacher);

router.get('/teachers', getAllTeacher);

router.get('/teachers/:teacherId', getTeacher);

router.put('/teachers/:teacherId/update', updateAccountDetails);

router.put('/teachers/:teacherId/update-avatar', upload.single('avatar'), updateprofileImageUrl);

export default router;
