import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { model } from "../config/gemini.AI";

export const chatController = async (req: Request, res: Response) => {
  try {

    const user = (req as any).user;
    const userId = user.userId;

    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        message: "Message is required"
      });
    }

    /* 1️⃣ Get last 5 chats */
    const chats = await prisma.chat.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5
    });

    /* 2️⃣ Build context */
    let history = "";

    chats.reverse().forEach(chat => {
      const msgs = chat.messages as any[];

      msgs.forEach(msg => {
        history += `${msg.role}: ${msg.content}\n`;
      });
    });

    history += `user: ${message}\nassistant:`;

    /* 3️⃣ Call Gemini */
    const result = await model.generateContent(history);

    const aiReply = result.response.text();

    /* 4️⃣ Save chat */
    await prisma.chat.create({
      data: {
        userId,
        messages: [
          { role: "user", content: message },
          { role: "assistant", content: aiReply }
        ]
      }
    });

    res.json({
      reply: aiReply
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Chat failed"
    });

  }
};