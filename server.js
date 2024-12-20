import OpenAI from "openai"
import { getCurrentWeather, getLocation, tools } from "./tools.js"
import dotenv from "dotenv"

dotenv.config();

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

const availableFunctions = {
    getCurrentWeather,
    getLocation
}

async function agent(query) {
    const messages = [
        { role: "system", content: "You are a helpful AI agent. Give highly specific answers based on the information you're provided. Prefer to gather information with the tools provided to you rather than giving basic, generic answers." },
        { role: "user", content: query }
    ]

    const MAX_ITERATIONS = 3

    for (let i = 0; i < MAX_ITERATIONS; i++) {
        console.log(`Iteration #${i + 1}`)
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-1106",
            messages,
            tools
        })
        if(response.choices[0].finish_reason === "stop"){
            console.log(response.choices[0].finish_reason);
            console.log(response.choices[0].message.content);
            console.log("Agent: Task Complete.");
            
            return response.choices[0].message.content;
        }
        else if(response.choices[0].finish_reason ==="tool_calls")
        {
            const toolCallMessage = response.choices[0].message;
            console.log("Tool Calls Array",toolCallMessage.tool_calls);
            const toolCallsArray = response.choices[0].message.tool_calls;
            messages.push(toolCallMessage);

            for(const toolCall of toolCallsArray){

                const selectedFunction = toolCall.function.name;
                const selectedFunctionArguments = JSON.parse(toolCall.function.arguments);
                //We are calling the function here using the string access property of an object in javascript
                const functionResponseValue = await availableFunctions[selectedFunction](selectedFunctionArguments);
                console.log(`Name of the function getting called ${selectedFunction} and Function Respone ${functionResponseValue}`);
                messages.push({
                    tool_call_id:toolCall.id,
                    role:"tool",
                    name:selectedFunction,
                    content:functionResponseValue
                });

            }
        }
    }
}

await agent("what is the weather in my location today?")

/**
{
    "index": 0,
    "message": {
        "role": "assistant",
        "content": "As an AI, I don't have feelings, but I'm here to assist you with any questions or tasks you have. How can I help you today?"
    },
    "finish_reason": "stop"
}


{
    "index": 0,
    "message": {
        "role": "assistant",
        "content": null,
        "tool_calls": [
            {
                "id": "call_SDhXnJbvxSWwy1m1R1J43EmQ",
                "type": "function",
                "function": {
                    "name": "getLocation",
                    "arguments": "{}"
                }
            }
        ]
    },
    "finish_reason": "tool_calls"
}
 */