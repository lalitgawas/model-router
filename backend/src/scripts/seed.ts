import mongoose from "mongoose";
import { SessionModel } from "../models/Session";
import { PythonRunner } from "../python-runner";

const MONGODB_URI = "mongodb://127.0.0.1:27017/model-router";
const scriptPath = "C:\\Users\\lggaw\\projects\\model-router\\backend\\dataset\\embeddings.py";

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

const PROMPTS = [
    // --- SIMPLE PROMPTS ---
    "What is the capital of France?",
    "Translate 'hello' to Spanish.",
    "Write a python script to sum an array.",
    "Give me a recipe for chocolate chip cookies.",
    "How do I center a div in CSS?",
    "What is 2 + 2?",
    "Who wrote Romeo and Juliet?",
    "What are the primary colors?",
    "How many continents are there?",
    "What is the boiling point of water?",
    "What is the largest planet in our solar system?",
    "How do I say 'thank you' in Japanese?",
    "List 3 benefits of drinking water.",
    "What is a noun?",
    "How do you tie a tie?",
    "What is the speed of light?",
    "Who was the first president of the USA?",
    "What is the formula for area of a circle?",
    "How do I reset my password?",
    "Write a haiku about a cat.",
    "What is the capital of Japan?",
    "Translate 'good morning' to French.",
    "Write a javascript function to multiply two numbers.",
    "Give me a recipe for pancakes.",
    "How do I make text bold in HTML?",
    "What is 10 * 5?",
    "Who painted the Mona Lisa?",
    "What are the colors of the rainbow?",
    "How many days in a leap year?",
    "What is the freezing point of water?",
    "What is the smallest planet in our solar system?",
    "How do I say 'goodbye' in German?",
    "List 3 benefits of exercise.",
    "What is a verb?",
    "How do you boil an egg?",
    "What is the speed of sound?",
    "Who was the second president of the USA?",
    "What is the formula for perimeter of a rectangle?",
    "How do I clear browser cache?",
    "Write a haiku about a dog.",

    // --- MEDIUM PROMPTS ---
    "Explain the plot of Inception without spoilers.",
    "Write a polite email to my boss asking for vacation.",
    "How does a combustion engine work?",
    "Debug this python error: 'IndexError: list index out of range'.",
    "What were the main causes of WW1?",
    "How do I create a basic Express.js server?",
    "Explain the difference between SQL and NoSQL.",
    "Write a short story about a time traveler.",
    "What are the principles of Object Oriented Programming?",
    "How does photosynthesis work?",
    "Explain the plot of The Matrix without spoilers.",
    "Write a polite email to a client delaying a project.",
    "How does an electric motor work?",
    "Debug this javascript error: 'TypeError: undefined is not a function'.",
    "What were the main causes of WW2?",
    "How do I create a basic React component?",
    "Explain the difference between TCP and UDP.",
    "Write a short story about a space explorer.",
    "What are the SOLID principles?",
    "How does cellular respiration work?",
    "Explain the plot of Interstellar without spoilers.",
    "Write a polite email declining a job offer.",
    "How does a refrigerator work?",
    "Debug this java error: 'NullPointerException'.",
    "What were the main causes of the Cold War?",
    "How do I create a basic Vue component?",
    "Explain the difference between REST and GraphQL.",
    "Write a short story about a detective.",
    "What is the MVC pattern?",
    "How does the immune system work?",

    // --- COMPLEX PROMPTS ---
    "Design a highly scalable, distributed microservices architecture for a global video streaming platform. Include details on caching, database sharding, and CDN integration.",
    "Write a multi-threaded Rust server that handles real-time WebSocket connections with full type safety and strict borrow checker compliance.",
    "Explain the mathematical proof for Fermat's Last Theorem, breaking down the use of elliptic curves and modular forms.",
    "Analyze the historical impact of the Fall of the Roman Empire on modern European geopolitics, citing primary sources.",
    "Write a custom React hook to manage complex global state with full TypeScript generics, debouncing, and local storage synchronization.",
    "Develop a mathematical model for predicting stock market volatility using stochastic differential equations.",
    "Write a complete C++ implementation of a Red-Black Tree, including insertion, deletion, and rebalancing logic with zero memory leaks.",
    "Analyze the philosophical implications of quantum entanglement on the concept of free will and determinism.",
    "Design an AI recommendation engine using collaborative filtering and deep learning, explaining the loss function and gradient descent optimization.",
    "Write a comprehensive legal analysis of the implications of GDPR on blockchain immutability.",
    "Design a fault-tolerant distributed consensus algorithm, comparing Paxos and Raft in terms of network partition recovery.",
    "Write a Go microservice that implements a rate limiter using a distributed token bucket algorithm with Redis.",
    "Explain the mathematical formulation of the Schrödinger equation and its solutions for a quantum harmonic oscillator.",
    "Analyze the socio-economic impacts of universal basic income, referencing empirical data from pilot programs.",
    "Write a Python script that implements a custom transformer model from scratch using only NumPy.",
    "Develop a theoretical framework for faster-than-light travel based on the Alcubierre drive metric.",
    "Write a complete Java implementation of the A* search algorithm with a custom heuristic for a dynamic 3D environment.",
    "Analyze the ethical implications of artificial general intelligence on human labor markets and social structures.",
    "Design a scalable data pipeline using Apache Kafka and Spark Streaming for real-time anomaly detection.",
    "Write a comprehensive analysis of the role of epigenetics in transgenerational trauma."
];

async function seedDatabase() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");

        await SessionModel.deleteMany({});
        console.log("Cleared existing database");

        let highEndCount = 0;

        console.log(`Starting real routing test on ${PROMPTS.length} prompts... This might take a minute as it actually queries the FAISS vector DB for every prompt.`);

        for (let i = 0; i < PROMPTS.length; i++) {
            const prompt = PROMPTS[i];

            // Actually run the real router!
            const obj1 = new PythonRunner("find_best_model_for_prompt", scriptPath, prompt);
            const routed_model_str = obj1.runPythonFuntions(scriptPath, "find_best_model_for_prompt", prompt);

            if (!routed_model_str) {
                console.error(`Failed to route prompt ${i + 1}`);
                continue;
            }

            const all_models = JSON.parse(routed_model_str.toString());
            const modelUsed = all_models[0].model_name;

            if (HIGH_END_MODELS.includes(modelUsed)) {
                highEndCount++;
            }

            const session = new SessionModel({
                title: prompt.substring(0, 35) + "...",
                messages: [
                    {
                        role: "user",
                        content: prompt,
                        timestamp: new Date(Date.now() - (PROMPTS.length - i) * 100000)
                    },
                    {
                        role: "assistant",
                        content: "This is a simulated response. The important part is that the REAL router chose this model based on your FAISS database!",
                        model: modelUsed,
                        actualModel: modelUsed,
                        isFallback: false,
                        timestamp: new Date()
                    }
                ]
            });

            await session.save();
            process.stdout.write(`\rRouted prompt ${i + 1}/${PROMPTS.length} -> ${modelUsed.padEnd(30)}`);
        }

        console.log(`\n\n✅ Successfully routed and seeded ${PROMPTS.length} real chats!`);
        console.log(`📊 High-end model usage (based on real FAISS data): ${((highEndCount / PROMPTS.length) * 100).toFixed(1)}%`);
        console.log(`💰 Optimized routing (cheaper models): ${(((PROMPTS.length - highEndCount) / PROMPTS.length) * 100).toFixed(1)}%\n`);

        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
        process.exit(0);

    } catch (error) {
        console.error("\nError running real router test:", error);
        process.exit(1);
    }
}

seedDatabase();
