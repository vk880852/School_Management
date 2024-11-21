import { Router } from 'express';
import {
    registerClass,
    assignTeacherToClass,
    updateClass,
    deleteClass,
    getAllClass
} from '../Controller/class.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyJWT);

router.post('/classes', upload.fields([{ name: 'avatar', maxCount: 1 }]), registerClass);

router.put('/classes/assign-teacher', assignTeacherToClass);

router.get('/classes', getAllClass);

router.put('/classes/update', updateClass);

router.delete('/classes/:classId', deleteClass);

export default router;
