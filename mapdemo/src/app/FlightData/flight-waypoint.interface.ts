import {IFlightCoords} from "./flight-coords.interface";

export interface IFlightWaypoint {
  name: string; // the point corresponding airport name
  coords: IFlightCoords;
}
