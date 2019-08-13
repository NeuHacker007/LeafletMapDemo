import * as L from 'leaflet';
import * as geoJson from 'geojson';

export interface IMarkerTooltip {
  marker: L.Marker;
  latLng: L.LatLng;
  geoJsonPoint: geoJson.Feature;
}
