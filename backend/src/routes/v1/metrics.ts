import { Router } from "express";
import { SessionModel } from "../../models/Session";

export const metricsRouter = Router();

const HIGH_END_MODELS = [
    "meta/llama-2-70b-chat",
    "gpt-4-1106-preview",
    "claude-v2",
    "claude-v1",
    "claude-instant-v1",
    "claude-instant-v1.2",
    "gemini-3.1-pro",
    "gemini-3.6-flash"
];

metricsRouter.get("/", async (req, res) => {
    try {
        const sessions = await SessionModel.find();
        
        let totalRouted = 0;
        let highEndRouted = 0;

        sessions.forEach(session => {
            session.messages.forEach(msg => {
                // Only count assistant messages that went through the router
                if (msg.role === "assistant" && msg.model) {
                    totalRouted++;
                    if (HIGH_END_MODELS.includes(msg.model)) {
                        highEndRouted++;
                    }
                }
            });
        });

        const percentage = totalRouted > 0 ? (highEndRouted / totalRouted) * 100 : 0;

        res.status(200).json({
            totalRouted,
            highEndRouted,
            percentage: parseFloat(percentage.toFixed(1))
        });
    } catch (error) {
        console.error("Error fetching metrics:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
