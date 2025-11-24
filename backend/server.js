import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/assignments', assignmentRoutes);

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});
