import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize OpenAI client pointing to Google's Gemini endpoint
// This allows us to use the OpenAI SDK (and Agents SDK) with Gemini models
export const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

// Initialize Google Generative AI client for embeddings
// Note: Embeddings are NOT supported through the OpenAI compatibility layer
export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Centralized Model References
export const AI_MODELS = {
  chat: "gemini-2.5-flash",
  embedding: "models/gemini-embedding-001", // 3072-dimensional embeddings
};
