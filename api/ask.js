import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "..", "data", "knowledge.txt");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9ăâîșşțţ\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitIntoChunks(text, chunkSize = 700) {
  const cleaned = text.replace(/\r/g, "").trim();
  if (!cleaned) return [];

  const paragraphs = cleaned
    .split(/\n\s*\n/g)
    .map((p) => p.trim())
    .filter(Boolean);

  const chunks = [];
  let buffer = "";

  for (const p of paragraphs.length ? paragraphs : [cleaned]) {
    if ((buffer + "\n\n" + p).length <= chunkSize) {
      buffer = buffer ? `${buffer}\n\n${p}` : p;
    } else {
      if (buffer) chunks.push(buffer);
      if (p.length <= chunkSize) {
        buffer = p;
      } else {
        for (let i = 0; i < p.length; i += chunkSize) {
          chunks.push(p.slice(i, i + chunkSize));
        }
        buffer = "";
      }
    }
  }

  if (buffer) chunks.push(buffer);
  return chunks;
}

function scoreChunk(chunk, question) {
  const q = normalize(question);
  const c = normalize(chunk);
  const words = q.split(" ").filter((w) => w.length > 2);

  let score = 0;
  for (const word of words) {
    if (c.includes(word)) score += 2;
  }
}
