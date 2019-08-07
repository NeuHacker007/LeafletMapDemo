import * as L from 'leaflet';

export interface IFlightWaypoint {
  name: string; // the point corresponding airport name
  coords: L.LatLng;
}
