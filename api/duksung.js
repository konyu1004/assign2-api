import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

console.log("API key length:", process.env.GEMINI_API_KEY?.length); 

const ai = new GoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  let body = req.body;

  if (!body || typeof body !== "object") {
    try {
      const rawBody = await new Promise((resolve, reject) => {
        let data = "";
        req.on("data", chunk => data += chunk);
        req.on("end", () => resolve(data));
        req.on("error", reject);
      });
      body = JSON.parse(rawBody);
    } catch {
      return res.status(400).json({ error: "잘못된 JSON 데이터입니다." });
    }
  }

  const { word } = body;
  if (!word) {
    return res.status(400).json({ error: "n행시를 만들 단어(word)가 필요합니다." });
  }

  try {
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
아래 단어 '${word}'의 각 글자를 첫 글자로 사용하는 n행시를 만들어 주세요.
단어의 글자 수와 동일한 행 수를 가진 시로, 각 글자는 한 줄씩 시작합니다.
재치 있고 자연스러운 표현으로 만들어 주세요.
예: '감사합니다'라면 5행시가 됩니다.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

   } catch (err) {
  console.error("Gemini API 오류:", err); 

  return res.status(500).json({
    error: "AI 응답 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
  });
}

}
