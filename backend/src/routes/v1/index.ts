import { Router } from "express";
import { chatRouter } from "./chat";
import { sessionsRouter } from "./sessions";

export const router = Router();

router.use("/chat", chatRouter);
router.use("/sessions", sessionsRouter);