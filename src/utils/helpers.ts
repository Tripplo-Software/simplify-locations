// Package Imports

// Internal Imports
import { ReverseGeocodingInputData, SearchForPositionInput, SearchForPositionResultExtended, GeocodingInputData, SearchForTextInput, SearchForTextResultExtended, RouteWaypoint } from "./types";
import { asyncSearchForPosition, asyncSearchForText } from "./location";

// Pretty JSON
export const prettyJSON = (data : unknown) => {
  return JSON.stringify(data, null, 2);
}

// Uniform CloudWatch Logs
export const cloudLogs = (title: string, data: unknown) => {
  return console.log(title + "\n\n" + prettyJSON(data));
}

// Generate Current Date Epoch | Day:Month:Year:Hour:Minute
export const currentEpoch = () => {
  const currentDate = new Date().getTime() / 1000;
  const epoch = Math.floor(currentDate);
  return epoch;
};

// Force Async Wait
export const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Data Chunking | Simple root-level chunking
export const dataChunking = (data: unknown[], chunks: number) => {
  try {
    if (chunks === 0) {
      throw "Invalid chunk value | Chunk value zero will cause infinite loop!";
    }

    const resultArray: unknown[] = [];

    for (let i = 0; i < data.length; i += chunks) {
      resultArray.push(data.slice(i, i + chunks));
    }

    return resultArray;
  } catch(err) {
    return null;
  }
}

// Reverse Geocoding Handler for Batched Geocoding Data
export const reverseGeocodingHandler = async (data: ReverseGeocodingInputData[], placeIndex: string, region?: string, profile?: string) => {
  try {
    const searchForPosition = data.map(waypoint => {
      const payload: SearchForPositionInput = {
        id: waypoint.waypointId ? waypoint.waypointId : null,
        placeIndex: placeIndex,
        position: [waypoint.long, waypoint.lat],
        region: region,
        profile: profile
      }

      return asyncSearchForPosition(payload);
    });

    const positionalData = await Promise.all(searchForPosition);

    // TypeScript cannot descern new type from null filter
    const result = positionalData.filter(data => data !== null);
    const typeCastResult = result as SearchForPositionResultExtended[];

    return typeCastResult;
  } catch (err) {
    return null;
  }
}

// Reverse Geocoding Handler for Batched Geocoding Data
export const geocodingHandler = async (data: GeocodingInputData[], placeIndex: string, region?: string, profile?: string) => {
  try {
    const searchForText = data.map(waypoint => {
      const payload: SearchForTextInput = {
        id: waypoint.waypointId ? waypoint.waypointId : null,
        placeIndex: placeIndex,
        address: waypoint.address,
        region: region,
        profile: profile
      }

      return asyncSearchForText(payload);
    });

    const positionalData = await Promise.all(searchForText);

    // TypeScript cannot descern new type from null filter
    const result = positionalData.filter(data => data !== null);
    const typeCastResult = result as SearchForTextResultExtended[];

    return typeCastResult;
  } catch (err) {
    return null;
  }
}

// Random Int
export const randomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Exponential Backoff w/ Full-Jitter
export const backoff = async (attempt: number): Promise<void> => {
  const cap = 6000;
  const base = 250;

  const amount = randomInt((base * attempt), Math.min(cap, base * 2 ** attempt));
  
  await sleep(amount);

  return;
}

// Convert Waypoint Arrays to Method Ingestable Array
export const convertWaypoints = (data: RouteWaypoint[]) => {
  const result: number[][] = [];

  for (const waypoint of data) {
    result.push([waypoint.long, waypoint.lat]);
  }

  return result;
}
