import { Router } from "express";
import { OpenAI } from "openai";
import dotenv from "dotenv";
import { PythonRunner } from "../../python-runner";

dotenv.config();

export const chatRouter = Router();

let scriptPath = "C:\\Users\\lggaw\\projects\\model-router\\backend\\dataset\\embeddings.py";


chatRouter.post("/", async (req, res) => {
    const user_prompt = req.body.user_prompt;

    if (!user_prompt) {
        res.status(400).json({ message: "Prompt is required" });
        return;
    }

    console.log(user_prompt);


    let obj1 = new PythonRunner("find_best_model_for_prompt", scriptPath, user_prompt);

    const best_models = obj1.runPythonFuntions(scriptPath, "find_best_model_for_prompt", user_prompt);

    console.log("hii from ts")
    console.log(best_models);


    // try {
    //     const llm = new OpenAI({
    //         baseURL: "https://openrouter.ai/api/v1",
    //         apiKey: process.env.OPENROUTER_API_KEY!,
    //     });

    //     const response = await llm.chat.completions.create({
    //         model: "nvidia/nemotron-3-super-120b-a12b:free",
    //         temperature: 0.2,
    //         messages: [
    //             { role: "user", content: user_prompt },
    //         ]
    //     });

    //     console.log(response.choices[0].message.content)


    // } catch (error) {
    //     console.log(error);
    //     res.status(500).json({ message: "Internal server error" });
    // }
});