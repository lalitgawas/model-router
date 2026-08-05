import { Router } from "express";
import { chatRouter } from "./chat";

export const router = Router();


router.use("/chat", chatRouter);