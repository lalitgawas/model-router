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

    const system_prompt = ` ${best_models} From these models pick the optimal model that gives the response with respect to the cost. Mostly prefer lower cost model over performance.
    Also analyse the user_prompt and see if that model full fills the requirement of user_prompt. And give only the model name that you think is optimal for this prompt.  `

    // const system_prompt = ` ${best_models} pick the model that best suits the prompt. Only give name of the model `

    try {
        if (best_models) {
            const llm = new OpenAI({
                baseURL: "https://openrouter.ai/api/v1",
                apiKey: process.env.OPENROUTER_API_KEY!,
            });

            const model_name = await llm.chat.completions.create({
                model: "nvidia/nemotron-3-super-120b-a12b:free",
                temperature: 0.2,
                messages: [
                    { role: "user", content: user_prompt },
                    { role: "system", content: system_prompt }
                ]
            });

            console.log(model_name.choices[0].message.content)

            const response = await llm.chat.completions.create({
                model: "nvidia/nemotron-3-super-120b-a12b:free",
                temperature: 0.2,
                messages: [
                    { role: "user", content: user_prompt }
                ]
            });

            res.status(200).json({
                message: response.choices[0].message.content,
                model: model_name.choices[0].message.content
            })

        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});