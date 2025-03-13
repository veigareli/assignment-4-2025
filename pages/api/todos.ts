import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const todos = await prisma.todo.findMany();
    const mappedTodos = todos.map((todo) => ({
      ...todo,
      text: todo.title as string, // Ensuring `title` is always treated as a string
    }));
    return res.status(200).json(mappedTodos);
  }

  if (req.method === "POST") {
    const { text } = req.body;

    if (typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ error: "Text is required and must be a string" });
    }

    const newTodo = await prisma.todo.create({
      data: {
        title: text,
        completed: false,
      },
    });

    return res.status(201).json({ ...newTodo, text: newTodo.title });
  }

  if (req.method === "PUT") {
    const { id } = req.query;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const todo = await prisma.todo.findUnique({ where: { id } });
    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }

    const updatedTodo = await prisma.todo.update({
      where: { id },
      data: { completed: !todo.completed },
    });

    return res.status(200).json({ ...updatedTodo, text: updatedTodo.title });
  }

  if (req.method === "DELETE") {
    const { id } = req.query;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Invalid ID" });
    }

    try {
      await prisma.todo.delete({ where: { id } });
      return res.status(200).json({ message: "Todo deleted successfully" });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        return res.status(200).json({ message: "Todo already deleted" });
      }
      console.error("Error deleting todo:", error);
      return res.status(500).json({ error: "Failed to delete todo" });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
