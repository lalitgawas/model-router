import { Router } from "express";
import { chatRouter } from "./chat";
import { sessionsRouter } from "./sessions";
import { metricsRouter } from "./metrics";

export const router = Router();

router.use("/chat", chatRouter);
router.use("/sessions", sessionsRouter);
router.use("/metrics", metricsRouter);