import express from "express";
import { router } from "./routes/v1"
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

dotenv.config();

const app = express();
app.use(express.json())
app.use(cors())

app.use("/api/v1", router);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/model-router")
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

app.listen(process.env.PORT || 3000, () => {
    console.log("Server started on port", process.env.PORT || 3000);
});