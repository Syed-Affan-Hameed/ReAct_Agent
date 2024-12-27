export const getCurrentWeather = async ({location}) => {

  return JSON.stringify({
    location:location,
    type: "snowy",
    temperature: 72.5,
  });
};

export const getLocation = async () => {
  try {
    const locationFromAPIResponse = await fetch('https://ipapi.co/json');
    
    if (!locationFromAPIResponse.ok) {
      throw new Error('Rate limited or unable to fetch location');
    }

    const locationResponseText = await locationFromAPIResponse.json();

    if (locationResponseText) {
      return JSON.stringify(locationResponseText);
    }
  } catch (error) {
    console.error('Error fetching location:', error);
  }

  return JSON.stringify({
    cityname: "Bengaluru",
  });
};

export const tools = [
  {
      type: "function",
      function: {
          name: "getCurrentWeather",
          description: "Get the current weather",
          parameters: {
              type: "object",
              properties: {
                location: {
                  type: "string",
                  description: "location to get the weather for",
                }
              },
              required: ["location"],
              additionalProperties: false,
              strict:true
          }
      }
  },
  {
      type: "function",
      function: {
          name: "getLocation",
          description: "Get the user's current location",
          parameters: {
              type: "object",
              properties: {}
          }
      }
  },
]

export const newTools =[
  {
    type: 'function',
    function: {
      function: getLocation,
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "location to get the weather for",
          }
        },
        required: ["location"],
        additionalProperties: false,
    }
    },
  },
  {
    type: 'function',
    function: {
      function: getCurrentWeather,
      parse: JSON.parse, // or use a validation library like zod for typesafe parsing.
      parameters: {
        type: 'object',
        properties: {
          location: { type: 'string' },
        },
      },
    },
  },
]