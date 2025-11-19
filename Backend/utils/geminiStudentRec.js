// backend/utils/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// A reusable generator function
export const generateStudentRecommendation = async ({ name, grade, subject, performance }) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `

   You are an expert Kenyan CBC tutor giving personalized advice.

Student: ${name}
Grade: ${grade}
Subject: ${subject}
Recent Performance: ${performance}%

Give a short, practical, encouraging recommendation in 3–5 sentences (max 100 words).
Include:
- One strength or effort acknowledgment
- One specific area to improve
- One teaching strategy or resource (local or YouTube)
- One actionable next step for the teacher

Use warm, positive tone. Respond in clear English/Kiswahili mix if natural.
Example: "John is doing well in reading but struggles with comprehension. Try story retelling games. Watch 'Tahamaki TV - Grade 4 Stories' on YouTube."
      
    `;
    // You are an expert Kenyan CBC curriculum assistant.
    //   Generate ${type} content for Grade ${grade} ${subject}.
    //   ${topic ? `Topic: ${topic}` : ""}
    //   Format the response in clear, teacher-friendly structure.

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return {
      success: true,
      content: text,
      generatedAt: new Date().toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })
    };
  } catch (error) {
    console.error("Gemini error:", error);
    return { success: false, error: error.message };
  }
};
