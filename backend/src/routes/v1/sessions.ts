import { Router } from "express";
import { SessionModel } from "../../models/Session";

export const sessionsRouter = Router();

// Get all sessions
sessionsRouter.get("/", async (req, res) => {
    try {
        const sessions = await SessionModel.find().sort({ createdAt: -1 });
        res.status(200).json(sessions);
    } catch (error) {
        console.error("Error fetching sessions:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get a specific session
sessionsRouter.get("/:id", async (req, res) => {
    try {
        const session = await SessionModel.findById(req.params.id);
        if (!session) {
             res.status(404).json({ message: "Session not found" });
             return;
        }
        res.status(200).json(session);
    } catch (error) {
        console.error("Error fetching session:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Create a new session
sessionsRouter.post("/", async (req, res) => {
    try {
        const newSession = new SessionModel({
            title: "New Chat",
            messages: []
        });
        const savedSession = await newSession.save();
        res.status(201).json(savedSession);
    } catch (error) {
        console.error("Error creating session:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
