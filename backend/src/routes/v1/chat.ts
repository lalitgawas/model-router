import { Router } from "express";
import { OpenAI } from "openai";
import dotenv from "dotenv";
import { PythonRunner } from "../../python-runner";
import { SessionModel } from "../../models/Session";
import { json } from "stream/consumers";

dotenv.config();

export const chatRouter = Router();

let scriptPath = "C:\\Users\\lggaw\\projects\\model-router\\backend\\dataset\\embeddings.py";

const FREE_FALLBACK_MODEL = "nvidia/nemotron-3-super-120b-a12b:free";

chatRouter.post("/", async (req, res) => {
    const { user_prompt, sessionId } = req.body;

    if (!user_prompt) {
        res.status(400).json({ message: "Prompt is required" });
        return;
    }
    if (!sessionId) {
        res.status(400).json({ message: "sessionId is required" });
        return;
    }

    try {
        const session = await SessionModel.findById(sessionId);
        if (!session) {
            res.status(404).json({ message: "Session not found" });
            return;
        }

        // Save user message
        session.messages.push({
            role: "user",
            content: user_prompt,
            timestamp: new Date()
        });

        if (session.messages.length === 1 || session.title === "New Chat") {
            session.title = user_prompt.substring(0, 35) + (user_prompt.length > 35 ? "..." : "");
        }
        await session.save();

        console.log(user_prompt);

        let obj1 = new PythonRunner("find_best_model_for_prompt", scriptPath, user_prompt);
        const routed_model = obj1.runPythonFuntions(scriptPath, "find_best_model_for_prompt", user_prompt);

        console.log("Routed model:", routed_model);
        const all_models = JSON.parse(routed_model!);


        const llm = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: process.env.OPENROUTER_API_KEY!,
        });

        let response = null;
        let actual_model_used = all_models[0].model_name;

        // Try the routed model first
        if (all_models[0].model_name) {
            try {
                response = await llm.chat.completions.create({
                    model: all_models[0].model_name,
                    temperature: 0.2,
                    messages: [{ role: "user", content: user_prompt }]
                });
            } catch (routedError: any) {
                console.log("*****************************************************")
                console.log(`Routed model "${all_models[0].model_name}" failed (${routedError?.status || "unknown"}). Falling back to free model.`);
            }
        }

        // Fallback to free model if routed model failed or wasn't available
        if (!response) {
            actual_model_used = FREE_FALLBACK_MODEL;
            response = await llm.chat.completions.create({
                model: FREE_FALLBACK_MODEL,
                temperature: 0.2,
                messages: [{ role: "user", content: user_prompt }]
            });
        }
        console.log("*****************************************************")
        console.log(`Routed: ${all_models[0].model_name} | Used: ${actual_model_used}`);

        const aiMessageContent = response.choices[0].message.content || "";

        // Save AI message
        session.messages.push({
            role: "assistant",
            content: aiMessageContent,
            model: all_models[0].model_name,
            actualModel: actual_model_used,
            isFallback: actual_model_used !== all_models[0].model_name,
            timestamp: new Date()
        });
        await session.save();

        res.status(200).json({
            message: aiMessageContent,
            model: all_models[0].model_name,               // What the router recommended
            actual_model: actual_model_used,    // What actually generated the response
            is_fallback: actual_model_used !== all_models[0].model_name,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
