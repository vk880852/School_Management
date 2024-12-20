import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';
const app=express();

// app.use(cors({
//     origin:process.env.CORS_ORIGIN,
//     credentials:true
// }));
app.use(cors());
app.use(express.json({
    limit:"16kb"
}))
app.use(express.urlencoded({
    limit:"16kb"
}))
app.use(express.static("public"));
app.use(cookieParser());
import classRouter from './routes/class.routes.js'
import ownerRouter from './routes/owner.route.js'
import teacherRouter from './routes/teacher.route.js'
import studentRouter from './routes/student.route.js'
app.use("/api/v1/owner", ownerRouter); 
app.use("/api/v1/teacher", teacherRouter);  
app.use("/api/v1/student", studentRouter); 
app.use("/api/v1/class", classRouter); 
export {app}