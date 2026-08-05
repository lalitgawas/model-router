import { Router } from "express";
import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

export const chatRouter = Router();

const PROMPT_TYPE = [
    {
        type: "coding",
        defaultModel: "nvidia/nemotron-3-ultra-550b-a55b:free",
        fallbackModels: ["poolside/laguna-m.1:free", "nvidia/nemotron-3-super-120b-a12b:free"]
    },
    {
        type: "normal",
        defaultModel: "nvidia/nemotron-nano-9b-v2:free",
        fallbackModels: ["nvidia/nemotron-nano-9b-v2:free", "google/gemma-4-31b-it:free"]
    },
    {
        type: "deep_research",
        defaultModel: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
        fallbackModels: ["google/gemma-4-31b-it:free", "nvidia/nemotron-3-nano-12b-think-it-v2:free"]
    }
]

chatRouter.post("/", async (req, res) => {
    const prompt = req.body.prompt;

    if (!prompt) {
        res.status(400).json({ message: "Prompt is required" });
        return;
    }

    console.log(prompt);

    const system_prompt = "if the prompt is of coding then only reply one word coding, if the prompt is related to deep research then only reply one word deep research, if the prompt is of normal query then only reply one word normal"

    try {
        const llm = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: process.env.OPENROUTER_API_KEY!,
        });

        const response = await llm.chat.completions.create({
            model: "nvidia/nemotron-3-super-120b-a12b:free",
            temperature: 0.2,
            messages: [
                { role: "user", content: prompt },
                { role: "system", content: system_prompt }
            ]
        });

        console.log(response.choices[0].message.content)

        const modelType = PROMPT_TYPE.find((item) => item.type === response.choices[0].message.content);

        if (!modelType) {
            res.status(500).json({ message: "Internal server error" });
            return;
        }

        console.log(modelType);

        const llm2 = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: process.env.OPENROUTER_API_KEY!,
        });

        const response2 = await llm2.chat.completions.create({
            model: modelType.defaultModel || modelType.fallbackModels[0] || "gpt-oss-120b",
            temperature: 0.2,
            messages: [
                { role: "user", content: prompt },
            ]
        });

        console.log(response2.choices[0].message.content)

        res.status(200).json({
            message: "Prompt received",
            data: response2.choices[0].message.content
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});