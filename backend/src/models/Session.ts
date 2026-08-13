import mongoose, { Schema, Document } from "mongoose";

export interface IMessage {
    role: "user" | "assistant";
    content: string;
    model?: string;
    actualModel?: string;
    isFallback?: boolean;
    timestamp: Date;
}

export interface ISession extends Document {
    title: string;
    messages: IMessage[];
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    model: { type: String },
    actualModel: { type: String },
    isFallback: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});

const SessionSchema = new Schema<ISession>({
    title: { type: String, required: true, default: "New Chat" },
    messages: [MessageSchema]
}, { timestamps: true });

export const SessionModel = mongoose.model<ISession>("Session", SessionSchema);
