// Package Imports
import * as AWS from "@aws-sdk/client-location";
import { CalculateRouteSummary, SearchPlaceIndexForTextRequest } from "@aws-sdk/client-location";
import { fromIni } from "@aws-sdk/credential-providers";

// Internal Imports
import { cloudLogs } from "../helpers";
import { ICalculcateRouteParams, SearchForPositionInput, SearchForPositionResultExtended, SearchForTextInput, SearchForTextResultExtended } from "../types";
import { backoff } from "../helpers";

const locationContext = (userRegion?: string, userProfile?: string) => {
  return new AWS.Location({
    region: userRegion ? userRegion : "eu-west-1",
    credentials: userProfile ? fromIni({profile: userProfile}) : undefined
  });
}

let positionSearchAttempt = 1;

// SearchPlaceIndexForPosition | Rate Limit: 50 per second
export const asyncSearchForPosition = ({ placeIndex, position, id, region, profile }: SearchForPositionInput) => {
  return new Promise<SearchForPositionResultExtended | null>((resolve) => {
    locationContext(region, profile).searchPlaceIndexForPosition({
      IndexName: placeIndex,
      Position: position
    }, async (err, data) => {
      if (err) {
        // This exception does not necessarily mean failure
        if (err.name === "TooManyRequestsException") {
          const limit = 5;

          while (positionSearchAttempt < limit) {
            positionSearchAttempt += 1;

            await backoff(positionSearchAttempt);

            const retryResult = await asyncSearchForPosition({ placeIndex, position, id });

            if (retryResult !== null) {
              return resolve(retryResult);
            }
          }
        }

        cloudLogs("SEARCH-POSITION-ERROR:", err);

        return resolve(null);
      }

      // CHECK - data/response is not defined
      if (!data) {
        return resolve(null);
      }
      
      // CHECK - Results property is not defined
      if (!data.Results) {
        return resolve(null);
      }

      // CHECK - Zero Results Returned
      if (data.Results.length === 0) {
        return resolve(null);
      }

      return resolve({
        waypointId: id ? id : null,
        ...data.Results[0]
      });
    });
  });
}

let textSearchAttempt = 1;

// SearchPlaceIndexForText  | Rate Limit: 50 per second
export const asyncSearchForText = ({ placeIndex, address, id, region, profile }: SearchForTextInput) => {
  const requestPayload: SearchPlaceIndexForTextRequest = {
    IndexName: placeIndex,
    Text: address,
    MaxResults: 3,
    Language: "en"
  }

  return new Promise<SearchForTextResultExtended | null>((resolve) => {
    locationContext(region, profile).searchPlaceIndexForText(requestPayload, async (err, data) => {
      if (err) {
        // This exception does not necessarily mean failure
        if (err.name === "TooManyRequestsException") {
          const limit = 5;

          while (textSearchAttempt < limit) {
            textSearchAttempt += 1;

            await backoff(textSearchAttempt);

            const retryResult = await asyncSearchForText({ placeIndex, address, id });

            if (retryResult !== null) {
              return resolve(retryResult);
            }
          }
        }

        cloudLogs("SEARCH-TEXT-ERROR:", err);

        return resolve(null);
      }

      // CHECK - data/response is not defined
      if (!data) {
        return resolve(null);
      }
      
      // CHECK - Results property is not defined
      if (!data.Results) {
        return resolve(null);
      }

      // CHECK - Zero Results Returned
      if (data.Results.length === 0) {
        return resolve(null);
      }

      return resolve({
        waypointId: id ? id : null,
        ...data.Results[0]
      });
    });
  });
}

let calculateRouteAttempt = 1;

// CalculateRoute | Rate Limit: 10 per second
export const asyncCalculateRoute = ({ requestParams, region, profile }: ICalculcateRouteParams) => {
  return new Promise<CalculateRouteSummary | null>((resolve) => {
    locationContext(region, profile).calculateRoute(requestParams, async (err, data) => {
      if (err) {
        // This exception does not necessarily mean failure
        if (err.name === "TooManyRequestsException") {
          const limit = 5;

          while (calculateRouteAttempt < limit) {
            calculateRouteAttempt += 1;

            await backoff(calculateRouteAttempt);

            const retryResult = await asyncCalculateRoute({
              requestParams: requestParams,
              region: region,
              profile: profile
            });

            if (retryResult !== null) {
              return resolve(retryResult);
            }
          }
        }

        cloudLogs("CALCULATE-ROUTE-ERROR:", err);

        return resolve(null);
      }

      // CHECK - data/response is not defined
      if (!data) {
        return resolve(null);
      }

      // CHECK - summary is not defined
      if (!data.Summary) {
        return resolve(null);
      }

      return resolve(data.Summary);
    });
  });
}
