const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the Google AI client with your API key from .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generates a response from the Gemini model based on a given prompt.
 * @param {string} prompt - The full prompt to send to the AI.
 * @returns {Promise<string>} The text response from the AI.
 */
async function getChatbotResponse(prompt) {
  try {
    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      // Loosening safety settings can help prevent the model from blocking
      // responses due to content from your database being misinterpreted.
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;

    if (response.promptFeedback?.blockReason) {
      console.error('Gemini response was blocked:', response.promptFeedback.blockReason);
      return "I'm sorry, I can't respond to that specific query. Please try rephrasing.";
    }

    const text = response.text();
    return text;
  } catch (error) {
    // Log the full error for better debugging on the server side.
    // This will show if it's an API key issue, billing issue, etc.
    console.error("Error communicating with Gemini API:", error.message);
    if (error.cause) {
      console.error("Underlying cause:", error.cause);
    }
    // Handle 503 Service Unavailable specifically
    if (error.message && error.message.includes('503')) {
      return "My AI brain is a bit overloaded at the moment. Please try asking again in a few seconds.";
    }
    // Provide a generic error message to the user
    return "I'm sorry, I'm having trouble connecting to my brain right now. Please try again later.";
  }
}

/**
 * Generates a JSON response from the Gemini model.
 * @param {string} prompt - The prompt asking the AI to generate a JSON object.
 * @returns {Promise<object>} The parsed JSON object from the AI.
 */
async function getJsonAiResponse(prompt) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      generationConfig: {
        response_mime_type: "application/json",
      },
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error("Error getting JSON response from Gemini API:", error);
    // Handle 503 Service Unavailable specifically
    if (error.message && error.message.includes('503')) {
      throw new Error("The AI service is temporarily overloaded. Please try again in a moment.");
    }
    throw new Error("Failed to get a structured response from AI.");
  }
}

module.exports = {
  getChatbotResponse,
  getJsonAiResponse,
};
