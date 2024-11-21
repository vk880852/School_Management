import {Router} from 'express'
import {upload} from '../middlewares/multer.middleware.js'
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {Registerowner,
getAllStudent,
getStudentById,
updateStudent} from '../Controller/students.controller.js'
const router = Router();

router.use(verifyJWT);
router.post('/register', upload.single('avatar'), Registerowner);
router.get('/', getAllStudent);
router.get('/:studentId', getStudentById);
router.put('/:studentId', upload.single('avatar'), updateStudent);

export default router;
