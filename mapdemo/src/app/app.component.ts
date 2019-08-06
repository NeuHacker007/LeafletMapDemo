import {Component, OnDestroy, OnInit} from '@angular/core';
import * as L from 'leaflet';
import * as Geojson from 'geojson';
import geojsonvt from 'geojson-vt';
import '../../node_modules/leaflet-canvas-marker-labinno/dist/leaflet.canvas-markers';
import {AsimsAcarsService, AsimsAirportsService, AsimsVdlService} from "./MapServices";
import {Subscription} from "rxjs";

const NAUTICAL_MILE_PER_METER = 0.000539957;
const CIRCLE_RADIUS_IN_NATUTICALMILE = 200;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  private leafletMap: L.Map;
  private acarStationGeoJsonData;
  private airportGeoJsonData;
  private vdlGeoJsonData;
  private acarstationLayer;
  private acarstationGeoLayers: L.Layer[];
  private airportLayer;
  private airportGeoLayers: L.Layer[];
  private vdlstationLayer;
  private vdlstationGeoLayers: L.Layer[];
  private acarMarkers: L.Marker[] = [];
  private airportMarkers: L.Marker[] = [];
  private vdlMarkers: L.Marker[] = [];

  private acarStationCircleTracker: Map<number[], L.Circle> = new Map<number[], L.Circle>();
  private acarStationMarkerTracker: Map<number[], L.Circle> = new Map<number[], L.Circle>();
  private airportCircleTracker: Map<number[], L.Circle> = new Map<number[], L.Circle>();
  private airportMarkerTracker: Map<number[], L.Circle> = new Map<number[], L.Circle>();
  private vdlStationCircleTracker: Map<number[], L.Circle> = new Map<number[], L.Circle>();
  private vdlStationMarkerTracker: Map<number[], L.Circle> = new Map<number[], L.Circle>();

  private geojsonvtOption = {
    maxZoom: 20,  // max zoom to preserve detail on; can't be higher than 24
    tolerance: 3, // simplification tolerance (higher means simpler)
    extent: 4096, // tile extent (both width and height)
    buffer: 64,   // tile buffer on each side
    debug: 0,     // logging level (0 to disable, 1 or 2)
    lineMetrics: false, // whether to enable line metrics tracking for LineString/MultiLineString features
    promoteId: null,    // name of a feature property to promote to feature.id. Cannot be used with `generateId`
    generateId: false,  // whether to generate feature ids. Cannot be used with `promoteId`
    indexMaxZoom: 5,       // max zoom in the initial tile index
    indexMaxPoints: 1000 // max number of points per tile in the index

  }
  private acarStationMakerOption = {
    icon: new L.Icon({
      iconUrl: '../assets/broadcast-tower-solid.svg',
      iconSize: [24, 24],
      // To make the leaflet canvas marker working properly, we had to provide icon anchor
      iconAnchor: [0, 0]
    })
  };
  private airportMakerOption = {
    icon: new L.Icon({
      iconUrl: '../assets/Airport_symbol.svg',
      iconSize: [24, 24],
      // To make the leaflet canvas marker working properly, we had to provide icon anchor
      iconAnchor: [0, 0]
    })
  };
  private vdlStationMakerOption = {
    icon: new L.Icon({
      iconUrl: '../assets/building-solid.svg',
      iconSize: [24, 24],
      // To make the leaflet canvas marker working properly, we had to provide icon anchor
      iconAnchor: [0, 0]
    })
  };
  private readonly acarStationSubscription: Subscription;
  private readonly airportSubscription: Subscription;
  private readonly vdlStationSubscription: Subscription;
  private readonly LAYER_OSM = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 13,
    attribution: 'Open Street Map'
  });

  public layers: L.Layer[] = [];
  public layersControl = {
    baseLayers: {
      'Open Street Map': this.LAYER_OSM
    },
    overlays: {}
  };
  public options = {
    zoom: 13,
    center: L.latLng(39.1696, -76.6786)
  };

  constructor(
    private acarsDataService: AsimsAcarsService,
    private airportDataService: AsimsAirportsService,
    private vdlDataService: AsimsVdlService) {

    this.acarStationSubscription = acarsDataService.getData().subscribe((result) => {
      this.acarStationGeoJsonData = result;
    });
    this.airportSubscription = airportDataService.getData().subscribe((result) => {
      this.airportGeoJsonData = result;
    });
    this.vdlStationSubscription = vdlDataService.getData().subscribe((result) => {
      this.vdlGeoJsonData = result;
    });

  }

  public ngOnInit(): void {
    this.apply();
  }

  public ngOnDestroy(): void {
    if (this.acarStationSubscription) {
      this.acarStationSubscription.unsubscribe();
    }
    if (this.airportSubscription) {
      this.airportSubscription.unsubscribe();
    }
    if (this.vdlStationSubscription) {
      this.vdlStationSubscription.unsubscribe();
    }
    if (this.acarMarkers.length > 0) {
      this.acarMarkers = [];
    }
    if (this.airportMarkers.length > 0) {
      this.airportMarkers = [];
    }
    if (this.vdlMarkers.length > 0) {
      this.vdlMarkers = [];
    }
  }

  public enableToolTip(event: MouseEvent) {
    if (this.acarstationLayer && this.leafletMap && this.leafletMap.hasLayer(this.acarstationLayer)) {
      this.acarstationLayer.eachLayer((layer: L.Layer) => {
        if (!layer.isTooltipOpen()) {
          layer.openTooltip();
        }
      });
    }
    if (this.airportLayer && this.leafletMap && this.leafletMap.hasLayer(this.airportLayer)) {
      this.acarstationLayer.eachLayer((layer: L.Layer) => {
        if (!layer.isTooltipOpen()) {
          layer.openTooltip();
        }
      });
    }
    if (this.vdlstationLayer && this.leafletMap && this.leafletMap.hasLayer(this.vdlstationLayer)) {
      this.vdlstationLayer.eachLayer((layer: L.Layer) => {
        if (!layer.isTooltipOpen()) {
          layer.openTooltip();
        }
      });
    }
  }

  public disableToolTip(event: MouseEvent) {
    if (this.acarstationLayer && this.leafletMap && this.leafletMap.hasLayer(this.acarstationLayer)) {
      this.acarstationLayer.eachLayer((layer: L.Layer) => {
        if (layer.isTooltipOpen()) {
          layer.closeTooltip();
        }
      });
    }
    if (this.airportLayer && this.leafletMap && this.leafletMap.hasLayer(this.airportLayer)) {
      this.acarstationLayer.eachLayer((layer: L.Layer) => {
        if (layer.isTooltipOpen()) {
          layer.closeTooltip();
        }
      });
    }
    if (this.vdlstationLayer && this.leafletMap && this.leafletMap.hasLayer(this.vdlstationLayer)) {
      this.vdlstationLayer.eachLayer((layer: L.Layer) => {
        if (layer.isTooltipOpen()) {
          layer.closeTooltip();
        }
      });
    }
  }

  public drawAcarStationCircle(event: MouseEvent): void {
    if (this.acarstationLayer
      && this.leafletMap
      && this.leafletMap.hasLayer(this.acarstationLayer)
      && this.acarMarkers.length > 0
    ) {
      this.acarMarkers.forEach((marker: L.Marker) => {
        const circle: L.Circle = L.circle(marker._latlng,
          {
            radius: CIRCLE_RADIUS_IN_NATUTICALMILE / NAUTICAL_MILE_PER_METER,
            color: '#ff6666',
            dashArray: '10',
            fill: false
          }
        ).addTo(this.leafletMap)
        this.acarStationCircleTracker.set(marker._latlng, circle);
      });

    } else {
      alert('Acar layer is not active')
    }
    console.log(event);
  }

  public drawAirportCircle(event: MouseEvent): void {
    if (this.airportLayer
      && this.leafletMap
      && this.leafletMap.hasLayer(this.airportLayer)
      && this.airportMarkers.length > 0
    ) {
      this.airportMarkers.forEach((marker: L.Marker) => {
        const circle: L.Circle = L.circle(marker._latlng,
          {
            radius: CIRCLE_RADIUS_IN_NATUTICALMILE / NAUTICAL_MILE_PER_METER,
            color: 'gray',
            dashArray: '10',
            fill: false
          }
        ).addTo(this.leafletMap)
        this.airportCircleTracker.set(marker._latlng, circle);
      });

    } else {
      alert('airport layer is not active')
    }
  }

  public drawVdlStationCircle(event: MouseEvent): void {
    if (this.vdlstationLayer
      && this.leafletMap
      && this.leafletMap.hasLayer(this.vdlstationLayer)
      && this.vdlMarkers.length > 0
    ) {
      this.vdlMarkers.forEach((marker: L.Marker) => {
        const circle: L.Circle = L.circle(marker._latlng,
          {
            radius: CIRCLE_RADIUS_IN_NATUTICALMILE / NAUTICAL_MILE_PER_METER,
            color: 'red',
            dashArray: '10',
            fill: false
          }
        ).addTo(this.leafletMap)
        this.vdlStationCircleTracker.set(marker._latlng, circle);
      });

    } else {
      alert('vdl station layer is not active')
    }
  }

  public onMapReady(map: L.Map) {
    this.leafletMap = map ? map : undefined;
    const tileindex = geojsonvt(this.acarStationGeoJsonData, this.geojsonvtOption);

    this.setAcarStationLayerFromGeoJson();
    this.setAirportLayerFromGeoJson();
    this.setVdlStationLayerFromGeoJson();
    this.acarstationLayer = L.canvasIconLayer({}).addTo(this.leafletMap);
    this.acarstationLayer.addLayers(this.acarMarkers);
    this.airportLayer = L.canvasIconLayer({}).addTo(this.leafletMap);
    this.airportLayer.addLayers(this.airportMarkers);
    this.vdlstationLayer = L.canvasIconLayer({}).addTo(this.leafletMap);
    this.vdlstationLayer.addLayers(this.vdlMarkers);

    this.layersControl.overlays = {
      acarstation: this.acarstationLayer,
      airport: this.airportLayer,
      vdlstation: this.vdlstationLayer
    };

    this.leafletMap.on("overlayremove", () => {
      if (this.acarstationLayer
        && this.leafletMap
        && !this.leafletMap.hasLayer(this.acarstationLayer)
        && this.acarStationCircleTracker.size > 0) {
        this.leafletMap.eachLayer((layer) => {
          this.leafletMap.removeLayer(layer);
          this.leafletMap.closePopup();
          layer.closeTooltip();
        });
        this.acarStationCircleTracker.clear();
      }
      if (this.airportLayer
        && this.leafletMap
        && !this.leafletMap.hasLayer(this.airportLayer)
        && this.airportCircleTracker.size > 0) {
        this.leafletMap.eachLayer((layer) => {
          this.leafletMap.removeLayer(layer);
          this.leafletMap.closePopup();
          layer.closeTooltip();
        });
        this.airportCircleTracker.clear();
      }

      if (this.vdlstationLayer
        && this.leafletMap
        && !this.leafletMap.hasLayer(this.vdlstationLayer)
        && this.vdlStationCircleTracker.size > 0) {
        this.leafletMap.eachLayer((layer) => {
          this.leafletMap.removeLayer(layer);
          this.leafletMap.closePopup();
          layer.closeTooltip();
        });
        this.acarStationCircleTracker.clear();
      }
    });
  }

  private setAcarStationLayerFromGeoJson(): void {
    this.acarstationGeoLayers = L.geoJSON(this.acarStationGeoJsonData, {
        pointToLayer: (geoJsonPoint, latlng): L.Layer => {
          const marker = new L.Marker(latlng, this.acarStationMakerOption).bindTooltip(
            geoJsonPoint.properties.iata,
            {
              permanent: true,
              offset: L.point(30, 30)
            });
          this.acarMarkers.unshift(marker);
          return marker;
        },
        onEachFeature: (feature, layer) => {
          if (feature.properties
            && feature.properties.iata
            && feature.properties.frequency
          ) {
            const message = `
            I am an Acar station <br>
            IATA Code: ${feature.properties.iata} <br>
            Frequency: ${feature.properties.frequency}
            `;
            layer.bindPopup(message);
          }
        }
      }
    );
  }

  private setAirportLayerFromGeoJson(): void {
    this.airportGeoLayers = L.geoJSON(this.airportGeoJsonData, {
        pointToLayer: (geoJsonPoint, latlng): L.Layer => {
          const marker = new L.Marker(latlng, this.airportMakerOption).bindTooltip(
            geoJsonPoint.properties.iata,
            {
              permanent: true,
              offset: L.point(30, 30)
            });
          this.airportMarkers.unshift(marker);
          return marker;
        },
        onEachFeature: (feature, layer) => {
          if (feature.properties
            && feature.properties.iata
            && feature.properties.numberOfVHFStations
            && feature.properties.airport
            && feature.properties.city
            && feature.properties.state
            && feature.properties.country
          ) {
            const message = `
            I am an Airport <br>
            Airport Name: ${feature.properties.airport} <br>
            IATA Code: ${feature.properties.iata} <br>
            Num of VHF Station: ${feature.properties.numberOfVHFStations} <br>
            City: ${feature.properties.city} <br>
            State: ${feature.properties.state} <br>
            Country: ${feature.properties.country} <br>
            Frequency: ${feature.properties.frequency}
            `;
            layer.bindPopup(message);
          }
        }
      }
    );
  }

  private setVdlStationLayerFromGeoJson(): void {
    this.vdlstationGeoLayers = L.geoJSON(this.vdlGeoJsonData, {
        pointToLayer: (geoJsonPoint, latlng): L.Layer => {
          const marker = new L.Marker(latlng, this.vdlStationMakerOption).bindTooltip(
            geoJsonPoint.properties.iata,
            {
              permanent: true,
              offset: L.point(30, 30)
            })
          this.vdlMarkers.unshift(marker);
          return marker;
        },
        onEachFeature: (feature, layer) => {
          if (feature.properties
            && feature.properties.iata
            && feature.properties.frequency
          ) {
            const message = `
            I am an Vdl station <br>
            IATA Code: ${feature.properties.iata} <br>
            Frequency: ${feature.properties.frequency}
            `;
            layer.bindPopup(message);
          }
        }
      }
    );
  }

  private apply(): boolean {
    this.layers.push(this.LAYER_OSM);
    return false;
  }
}
