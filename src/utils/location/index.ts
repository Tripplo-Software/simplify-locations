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
          let attempt = 1;

          while (attempt < limit) {
            await backoff(attempt);

            const retryResult = await asyncSearchForPosition({ placeIndex, position, id });

            if (retryResult !== null) {
              return resolve(retryResult);
            }

            attempt++;
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
          let attempt = 1;

          while (attempt < limit) {
            await backoff(attempt);

            const retryResult = await asyncSearchForText({ placeIndex, address, id });

            if (retryResult !== null) {
              return resolve(retryResult);
            }

            attempt++;
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

export const asyncCalculateRoute = ({ requestParams, region, profile }: ICalculcateRouteParams) => {
  return new Promise<CalculateRouteSummary | null>((resolve) => {
    locationContext(region, profile).calculateRoute(requestParams, async (err, data) => {
      if (err) {
        // This exception does not necessarily mean failure
        if (err.name === "TooManyRequestsException") {
          const limit = 5;
          let attempt = 1;

          while (attempt < limit) {
            await backoff(attempt);

            const retryResult = await asyncCalculateRoute({
              requestParams: requestParams,
              region: region,
              profile: profile
            });

            if (retryResult !== null) {
              return resolve(retryResult);
            }

            attempt++;
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
