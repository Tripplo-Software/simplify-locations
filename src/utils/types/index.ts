// Package Imports
import * as AWS from "@aws-sdk/client-location";

export interface StringObject {
  [key: string]:      string;
}

export interface IWriteBanner {
  name:               string;
  value?:             string | number;
  clear:              boolean;
}

export interface ReverseGeocodingInput {
  data:               ReverseGeocodingInputData[];
}

export interface ReverseGeocodingInputData {
  waypointId:         string;
  lat:                number;
  long:               number;
}

export interface SearchForPositionInput {
  placeIndex:         string;
  position:           number[];
  id?:                string | null;
  region?:            string;
  profile?:           string;
}

interface SearchForPositionTrackedData {
  waypointId:         string | null;
}

export interface SearchForPositionResultExtended extends AWS.SearchForPositionResult, SearchForPositionTrackedData {}

export interface GeocodingInput {
  data:               GeocodingInputData[];
}

export interface GeocodingInputData {
  waypointId:         string;
  address:            string;
}

export interface SearchForTextInput {
  placeIndex:         string;
  address:            string;
  id?:                string | null;
  region?:            string;
  profile?:           string;
}

interface SearchForTextTrackedData {
  waypointId:         string | null;
}

export interface SearchForTextResultExtended extends AWS.SearchForTextResult, SearchForTextTrackedData {}

export interface WaypointId {
  id:                 string;
}

export interface RoutePoint {
  lat:                number;
  long:               number;
}

export interface RouteWaypoint extends RoutePoint, WaypointId {}

export interface ICalculateRoute {
  routeCalculator:        string;
  addressData:            CalculateRouteInputData;
  region?:                string;
  profile?:               string;
}

export interface CalculateRouteInputData {
  distanceUnit?:          AWS.DistanceUnit;
  vehicleType?:           AWS.TravelMode;
  departurePosition:      number[];
  destinationPosition:    number[];
  waypointPositions?:     RouteWaypoint[];
}

export interface IGeocodeAddress {
  placeIndex:         string;
  addressData:        GeocodingInputData[];
  region?:            string;
  profile?:           string;
}

export interface IReverseGeocodeAddress {
  placeIndex:         string;
  addressData:        ReverseGeocodingInputData[];
  region?:            string;
  profile?:           string;
}

export interface ICalculcateRouteParams {
  requestParams:      AWS.CalculateRouteRequest;
  region?:            string;
  profile?:           string;
}
