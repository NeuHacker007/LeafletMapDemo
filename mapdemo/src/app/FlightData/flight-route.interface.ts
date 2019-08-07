import {IFlightData} from "./flght-data.interface";
import {IFlightWaypoint} from "./flight-waypoint.interface";


export interface IFlightRoute extends IFlightData {
  wayPoints: Array<IFlightWaypoint>;
}
