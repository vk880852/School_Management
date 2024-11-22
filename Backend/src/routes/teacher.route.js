import { Router } from 'express';
import {
    registerTeacher,
    getAllTeacher,
    getTeacher,
    updateAccountDetails,
    updateprofileImageUrl,
    deleteTeacherProfile
} from '../Controller/teacher.controller.js'
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyJWT);

router.post('/register-teacher', upload.fields([{ name: 'avatar', maxCount: 1 }]), registerTeacher);

router.get('/', getAllTeacher);

router.get('/:teacherId', getTeacher);

router.put('/:teacherId/update', updateAccountDetails);

router.put('/:teacherId/update-avatar', upload.single('avatar'), updateprofileImageUrl);
router.delete('/:teacherId',deleteTeacherProfile);

export default router;
