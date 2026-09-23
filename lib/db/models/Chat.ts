import mongoose, { Model, Schema, Types } from "mongoose";

import type { Message } from "@/lib/ai/types";

export interface IChat {
  id: string;
  userId: Types.ObjectId;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatSummary {
  id: string;
  title: string;
}

const MessageSchema = new Schema<Message>(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
  },
  { _id: false },
);

const ChatSchema = new Schema<IChat>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    messages: { type: [MessageSchema], default: [] },
  },
  { timestamps: true },
);

ChatSchema.index({ userId: 1, updatedAt: -1 });

const Chat: Model<IChat> =
  (mongoose.models.Chat as Model<IChat>) ||
  mongoose.model<IChat>("Chat", ChatSchema);

export default Chat;
