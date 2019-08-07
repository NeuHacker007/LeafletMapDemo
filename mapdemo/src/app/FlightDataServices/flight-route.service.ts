import {mockFlightRouteDataService} from "./mock-flight-route-data-source.service";
import {flightRoutes} from "../FlightData";


export class FlightRouteService extends mockFlightRouteDataService {
  constructor() {
    super(flightRoutes);
  }
}
