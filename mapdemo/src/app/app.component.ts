import {Component} from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  private readonly LAYER_OSM = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 13,
    attribution: 'Open Street Map'
  })
  // Values to bind to Leaflet Directive
  layers: L.Layer[] = [];
  layersControl = {
    baseLayers: {
      'Open Street Map': this.LAYER_OSM
    },
    overlays: {}
  };
  options = {
    zoom: 13,
    center: L.latLng(39.1696, -76.6786,)
  };

  constructor() {
    this.apply();
  }

  apply() {
    this.layers.push(this.LAYER_OSM);
    return false;
  }
}
