import {Observable} from "rxjs";
import {IFlightRoute} from "../FlightData";

export interface IFlightRouteDataSource {
  getFlightRouteData(): Observable<Array<IFlightRoute>>;
}
