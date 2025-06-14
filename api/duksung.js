import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req, res) {
  const allowedOrigin = "https://konyu1004.github.io";

  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { word } = req.body;
  if (!word) {
    return res.status(400).json({ error: "n행시를 만들 단어(word)가 필요합니다." });
  }

  try {
    const prompt = `
아래 단어 '${word}'의 각 글자를 첫 글자로 사용하는 n행시를 만들어 주세요.
각 글자는 정확히 '${word}'의 문자와 일치해야 하며,
예를 들어 '온유'라면
온: (온으로 시작하는 내용)
유: (유로 시작하는 내용)
형식으로 작성해 주세요.
비슷한 소리나 변형은 사용하지 말고, 반드시 주어진 글자를 정확히 사용하세요. 
재치 있고 자연스러운 표현으로 만들어 주세요. 불필요한 설명은 생략합니다.

`;

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        systemInstruction: "재치 있고 자연스러운 n행시를 만들어 주세요."
      },
    });

   
    res.status(200).json({ answer: result.text });
  } catch (err) {
    console.error("Gemini API 오류:", err);
    res.status(500).json({
      error: "AI 응답 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
    });
  }
}
