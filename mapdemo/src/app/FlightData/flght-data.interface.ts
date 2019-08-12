import {IFlightCoords} from "./flight-coords.interface";

/**
 *  holds basic flight data which might use in flight tracker
 */
export interface IFlightData {
  iata: string;
  flightNumber: string;
  aircraftType: string;
  aircraftRegistration: string;
  originAirport: string;
  destinationAirport: string;
  currentPosition?: IFlightCoords;
  vias: Array<string>;
  altitude: number; // feet
  speed: number; // km/h
  countryCode: string;
}
