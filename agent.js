import OpenAI from "openai"
import { getCurrentWeather, getLocation, newTools } from "./tools.js"
import dotenv from "dotenv"
import readline from "readline"

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const availableFunctions = {
    getCurrentWeather,
    getLocation
}
const messages = [
    {
        role: "system",
        content: "You are a helpful AI agent. Give highly specific answers based on the information you're provided. Prefer to gather information with the tools provided to you rather than giving basic, generic answers."
    }
]
async function agent(query) {
  messages.push( { role: "user", content: query });
          
    const runner = openai.beta.chat.completions
    .runTools({
      model: 'gpt-3.5-turbo-1106',
      messages,
      tools: newTools
    }).on('message', (message) => console.log(message));

    const finalContent = await runner.finalContent();
    messages.push({ role: "system", content: finalContent });
    console.log("ChatBot:",finalContent);
}

function promptUser() {
    rl.question('You: ', async (query) => {
      if (query.toLowerCase() === 'exit') {
        rl.close();
        return;
      }
      await agent(query);
      promptUser();
    });
  }
  promptUser();