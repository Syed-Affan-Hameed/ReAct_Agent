export const getCurrentWeather = async () => {
  return JSON.stringify({
    type: "snowy",
    temperature: 72.5,
  });
};

export const getLocation = async () => {
  return JSON.stringify({
    cityname: "Bengaluru",
  });
};
