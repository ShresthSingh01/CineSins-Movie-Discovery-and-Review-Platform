const { GoogleGenerativeAI } = require("@google/generative-ai");

const GEMINI_API_KEY = "AIzaSyAtqf7tmSFm9rrjwn6ETL8t6CPfmZjT8qw";

async function testGemini() {
    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Say 'Gemini is online'");
        console.log("Gemini Test Result: SUCCESS - " + result.response.text());
    } catch (error) {
        console.log("Gemini Test Result: FAILED - " + error.message);
    }
}

testGemini();
