import {Injectable} from "@angular/core";
import {IFlightRouteDataSource} from "./flight-route-data-source.interface";
import {IFlightRoute} from "../FlightData";
import {BehaviorSubject, Observable} from "rxjs";


@Injectable()
export abstract class mockFlightRouteDataService implements IFlightRouteDataSource {

  private readonly routeData$: BehaviorSubject<Array<IFlightRoute>>;

  constructor(private flightRouteData: Array<IFlightRoute>) {
    this.routeData$ = new BehaviorSubject<Array<IFlightRoute>>(this.flightRouteData);
  }

  getFlightRouteData(): Observable<Array<IFlightRoute>> {
    return this.routeData$;
  }


}
