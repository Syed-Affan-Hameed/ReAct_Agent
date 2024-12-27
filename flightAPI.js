import OpenAI from "openai";
import { getCurrentWeather, getLocation, newTools } from "./tools.js";
import dotenv from "dotenv";
import Amadeus from 'amadeus';
import parse from 'date-fns/parse';
import axios from 'axios';

dotenv.config();

const amadeus = new Amadeus({
    clientId: process.env.AMADEUS_API_KEY,
    clientSecret: process.env.AMADEUS_API_SECRET,
});

const getFlightData = async (budget) => {
    const originCode = 'MEL';
    const destinationCode = 'JFK';
    const dateOfDeparture = '2024-12-28';

    try {
        const response = await amadeus.shopping.flightOffersSearch.get({
            originLocationCode: originCode,
            destinationLocationCode: destinationCode,
            departureDate: dateOfDeparture,
            adults: '1',
            max: '12',
            currencyCode: 'INR'
        });
        console.log("raw api response", JSON.stringify(response));
        const flightDetails = extractFlightDetails(response, budget);
        return flightDetails;
    } catch (error) {
        console.error('Error fetching flight data:', error);
    }
};

const extractFlightDetails = (data, budget) => {
    const flightOffers = data.data;
    const result = [];

    flightOffers.forEach((offer) => {
        const offerDetails = {
            id: offer.id,
            price: offer.price.total,
            currency: offer.price.currency,
            itineraries: []
        };

        offer.itineraries.forEach((itinerary) => {
            const itineraryDetails = {
                segments: []
            };

            itinerary.segments.forEach((segment) => {
                const segmentDetails = {
                    departure: segment.departure,
                    arrival: segment.arrival,
                    carrierCode: segment.carrierCode,
                    flightNumber: segment.number,
                    duration: segment.duration,
                    aircraft: segment.aircraft.code,
                    seating: []
                };

                offer.travelerPricings.forEach((travelerPricing) => {
                    travelerPricing.fareDetailsBySegment.forEach((fareDetail) => {
                        if (fareDetail.segmentId === segment.id) {
                            const seatPrice = parseFloat(travelerPricing.price.total);
                            if (seatPrice <= budget) {
                                segmentDetails.seating.push({
                                    cabin: fareDetail.cabin,
                                    class: fareDetail.class,
                                    fareBasis: fareDetail.fareBasis,
                                    brandedFare: fareDetail.brandedFare,
                                    brandedFareLabel: fareDetail.brandedFareLabel,
                                    price: travelerPricing.price.total
                                });
                            }
                        }
                    });
                });

                if (segmentDetails.seating.length > 0) {
                    itineraryDetails.segments.push(segmentDetails);
                }
            });

            if (itineraryDetails.segments.length > 0) {
                offerDetails.itineraries.push(itineraryDetails);
            }
        });

        if (offerDetails.itineraries.length > 0) {
            result.push(offerDetails);
        }
    });

    return result;
};

const getCityCoordinates = async (cityName) => {
    try {
        const response = await amadeus.referenceData.locations.get({
            keyword: cityName,
            subType: 'CITY'
        });
        //console.log("raw api response", JSON.stringify(response));
        const cityDetails = response.data[0];
        return cityDetails;
    } catch (error) {
        console.error('Error fetching city coordinates:', error);
    }
};

const getWeatherForecast = async (lat,long,dayStr) => {
    const OpenWeatherApiKey = process.env.OPEN_WEATHER_API_KEY;
    const unixTime = getUnixTime(dayStr);
    const url = `https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=${lat}&lon=${long}&dt=${unixTime}&appid=${OpenWeatherApiKey}`;

    try {
        const response = await axios.get(url);
        console.log("raw api response", JSON.stringify(response.data, null, 2));
        const weatherForecast = response.data;
        return weatherForecast;
    } catch (error) {
        console.error('Error fetching weather forecast:', error);
    }
};

const getUnixTime = (dateString) => {

    const dateStr = dateString;
    const date = parse(dateStr, "dd-MM-yyyy", new Date());
    const unixTime = date.getTime();
    
    console.log(`Unix time for ${dateStr} is: ${unixTime}`);
    return unixTime;
};
// const budget = 180000; // Set your budget here
// const receivedData = await getFlightData(budget);
//console.log("received data", JSON.stringify(receivedData, null, 2));

const city = 'Mysore'; // Set your city here
const cityCoordinates = await getCityCoordinates(city);
const lat = cityCoordinates.geoCode.latitude;
const long = cityCoordinates.geoCode.longitude;
const dateStr = "27-12-2024";
console.log(`City Co-ordinates: ${cityCoordinates.geoCode.latitude}, ${cityCoordinates.geoCode.longitude}`);

const weatherForecast = await getWeatherForecast(lat,long,dateStr);
console.log("Weather Forecast", JSON.stringify(weatherForecast, null, 2));



