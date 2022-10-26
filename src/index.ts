// Package Imports
import * as AWS from "@aws-sdk/client-location";

// Internal Imports
import { asyncCalculateRoute } from "./utils/location";
import {
  cloudLogs,
  convertWaypoints,
  dataChunking,
  geocodingHandler,
  reverseGeocodingHandler
} from "./utils/helpers";
import {
  ICalculateRoute,
  GeocodingInputData,
  SearchForTextResultExtended,
  ReverseGeocodingInputData,
  SearchForPositionResultExtended,
  IGeocodeAddress,
  IReverseGeocodeAddress, 
  ICalculcateRouteParams
} from "./utils/types";

// AWS Location - Calculate Route
export const calculateRoute = async ({ routeCalculator, addressData, region, profile }: ICalculateRoute) => {
  try {
    // Calculate Route - AWS Payload
    const requestParams: AWS.CalculateRouteRequest = {
      CalculatorName: routeCalculator,
      DepartNow: true,
      DistanceUnit: addressData.distanceUnit ? addressData.distanceUnit : "Kilometers",
      IncludeLegGeometry: false,
      TravelMode: addressData.vehicleType ? addressData.vehicleType : "Truck",
      TruckModeOptions: {
        AvoidFerries: true,
        AvoidTolls: false
      },
      DeparturePosition: addressData.departurePosition,
      DestinationPosition: addressData.destinationPosition,
      WaypointPositions: addressData.waypointPositions ? convertWaypoints(addressData.waypointPositions) : undefined
    }

    const payload: ICalculcateRouteParams = {
      requestParams: requestParams,
      region: region,
      profile: profile
    }

    const result = await asyncCalculateRoute(payload);

    if (!result) {
      throw "Failed to calculate route with provided payload data | calculateRoute";
    }

    return result;
  } catch (err) {
    cloudLogs("HANDLER-ERROR: [reverseGeocoding]", err);

    return null;
  }
}

// AWS Location - Search For Text
export const geocodeAddress = async ({ placeIndex, addressData, region, profile }: IGeocodeAddress) => {
  try {
    // Chunk Input Data
    const chunkedData = dataChunking(addressData, 5);

    if (!chunkedData) {
      throw "Failed to chunk geocoding input data";
    }

    // Process Reverse Geocoding Chunks
    const geocodingQuery = chunkedData.map(chunk => {
      const typeCastChunk = chunk as GeocodingInputData[];
      return geocodingHandler(typeCastChunk, placeIndex, region, profile);
    });

    const promises = await Promise.all(geocodingQuery);

    // TypeScript cannot descern new type from null filter
    const geocodingResult = promises.filter(data => data !== null);
    const typeCastGeocodingResult = geocodingResult as (SearchForTextResultExtended[])[];

    const responseData: SearchForTextResultExtended[] = [];

    // Merge Concurrent Results
    for (const positionalData of typeCastGeocodingResult) {
      responseData.push(...positionalData);
    }

    return responseData;
  } catch (err) {
    cloudLogs("HANDLER-ERROR: [geocodeAddress]", err);

    return null;
  }
}

// AWS Location - Search For Position
export const reverseGeocodeAddress = async ({ placeIndex, addressData, region, profile }: IReverseGeocodeAddress) => {
  try {
    // Chunk Input Data
    const chunkedData = dataChunking(addressData, 5);

    if (!chunkedData) {
      throw "Failed to chunk reverse-geocoding input data";
    }

    // Process Reverse Geocoding Chunks
    const reverseGeocodingQuery = chunkedData.map(chunk => {
      const typeCastChunk = chunk as ReverseGeocodingInputData[];
      return reverseGeocodingHandler(typeCastChunk, placeIndex, region, profile);
    });

    const promises = await Promise.all(reverseGeocodingQuery);

    // TypeScript cannot descern new type from null filter
    const reverseGeocodingResult = promises.filter(data => data !== null);
    const typeCastReverseGeocodingResult = reverseGeocodingResult as (SearchForPositionResultExtended[])[];

    const responseData: SearchForPositionResultExtended[] = [];

    // Merge Concurrent Results
    for (const positionalData of typeCastReverseGeocodingResult) {
      responseData.push(...positionalData);
    }

    return;
  } catch (err) {
    cloudLogs("HANDLER-ERROR: [reverseGeocodeAddress]", err);
    
    return;
  }
}
