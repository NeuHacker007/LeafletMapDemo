import {Component, OnDestroy, OnInit} from '@angular/core';
import * as L from 'leaflet';
import '../../node_modules/leaflet-canvas-marker-labinno/dist/leaflet.canvas-markers';
import '../../node_modules/leaflet-textpath/leaflet.textpath';
import '../../node_modules/leaflet.motion/dist/leaflet.motion.min';
import {AsimsAcarsService, AsimsAirportsService, AsimsVdlService} from "./MapServices";
import {Subscription} from "rxjs";
import {FlightRouteService} from "./FlightDataServices";
import {IFlightRoute} from "./FlightData";
import {IMarkerTooltip} from "./MarkerDataModel";
import * as geoJson from "geojson";

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
  private acarstationGeoLayers: L.Layer[];
  private airportGeoLayers: L.Layer[];
  private vdlstationGeoLayers: L.Layer[];
  private acarMarkers: L.Marker[] = [];
  private airportMarkers: L.Marker[] = [];
  private vdlMarkers: L.Marker[] = [];
  private acarMarkersTootips: Array<IMarkerTooltip> = [];
  private airportMarkersTootips: Array<IMarkerTooltip> = [];
  private vdlMarkersTootips: Array<IMarkerTooltip> = [];
  private canvasmarkerLayers;
  private acarStationCircleTracker: Map<number[], L.Circle> = new Map<number[], L.Circle>();
  private airportCircleTracker: Map<number[], L.Circle> = new Map<number[], L.Circle>();
  private vdlStationCircleTracker: Map<number[], L.Circle> = new Map<number[], L.Circle>();
  private isAcarStationOnMap: boolean = false;
  private isAirportOnMap: boolean = false;
  private isVdlStationOnMap: boolean = false;
  private flightRoutes: Array<IFlightRoute> = [];
  private flightPolyline;
  private flightRouteSequenceGroup;
  private isCurrentFlightMotionEnd: boolean = false;

  private acarStationMakerOption = {
    icon: new L.Icon({
      iconUrl: '../assets/broadcast-tower-solid.svg',
      iconSize: [24, 24],
      iconAnchor: [10, 9]
    })
  };
  private airportMakerOption = {
    icon: new L.Icon({
      iconUrl: '../assets/Airport_symbol.svg',
      iconSize: [24, 24],
      // To make the leaflet canvas marker working properly, we had to provide icon anchor
      iconAnchor: [10, 9]
    })
  };
  private vdlStationMakerOption = {
    icon: new L.Icon({
      iconUrl: '../assets/building-solid.svg',
      iconSize: [24, 24],
      // To make the leaflet canvas marker working properly, we had to provide icon anchor
      iconAnchor: [10, 9]
    })
  };
  private readonly acarStationSubscription: Subscription;
  private readonly airportSubscription: Subscription;
  private readonly vdlStationSubscription: Subscription;
  private readonly flightRoutesSubscription: Subscription;
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
    center: L.latLng(39.1696, -76.6786),
    perferCanvas: true
  };

  constructor(
    private acarsDataService: AsimsAcarsService,
    private airportDataService: AsimsAirportsService,
    private vdlDataService: AsimsVdlService,
    private flightRouteService: FlightRouteService
  ) {

    this.acarStationSubscription = this.acarsDataService.getData().subscribe((result) => {
      if (result) {
        this.acarStationGeoJsonData = result;
      } else {
        console.log('emitted acar station data is not valid');
      }
    });
    this.airportSubscription = this.airportDataService.getData().subscribe((result) => {
      if (result) {
        this.airportGeoJsonData = result;
      } else {
        console.log('emitted airport station data is not valid');
      }

    });
    this.vdlStationSubscription = this.vdlDataService.getData().subscribe((result) => {
      if (result) {
        this.vdlGeoJsonData = result;
      } else {
        console.log('emitted vdl station data is not valid');
      }
    });
    this.flightRoutesSubscription = this.flightRouteService.getFlightRouteData().subscribe((result) => {
      if (result) {
        this.flightRoutes = result;
      }
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
    if (this.flightRoutesSubscription) {
      this.flightRoutesSubscription.unsubscribe();
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
    if (this.acarMarkersTootips && this.acarMarkersTootips.length > 0 && this.isAcarStationOnMap) {
      this.acarMarkersTootips.forEach((item: IMarkerTooltip) => {
        item.marker.setTooltipContent(item.geoJsonPoint.properties.iata);
        item.marker.openTooltip();
      });
    } else {
      alert('acar marks is not on map');
    }
    if (this.airportMarkersTootips && this.airportMarkersTootips.length > 0 && this.isAirportOnMap) {
      this.airportMarkersTootips.forEach((item: IMarkerTooltip) => {
        item.marker.setTooltipContent(item.geoJsonPoint.properties.iata);
        item.marker.openTooltip();
      });
    } else {
      alert('airport marks is not on map');
    }
    if (this.vdlMarkersTootips && this.vdlMarkersTootips.length > 0 && this.isVdlStationOnMap) {
      this.vdlMarkersTootips.forEach((item: IMarkerTooltip) => {
        item.marker.setTooltipContent(item.geoJsonPoint.properties.iata);
        item.marker.openTooltip();
      });
    } else {
      alert('vdl marks is not on map');
    }
  }

  public disableToolTip(event: MouseEvent) {
    this.acarMarkersTootips.forEach((item: IMarkerTooltip) => {
      //item.marker.setTooltipContent(item.geoJsonPoint.properties.iata);
      item.marker.closeTooltip();
    });
    this.airportMarkersTootips.forEach((item: IMarkerTooltip) => {
      //item.marker.setTooltipContent(item.geoJsonPoint.properties.iata);
      item.marker.closeTooltip();
    });
    this.vdlMarkersTootips.forEach((item: IMarkerTooltip) => {
      //item.marker.setTooltipContent(item.geoJsonPoint.properties.iata);
      item.marker.closeTooltip();
    });
  }

  public drawAcarStationCircle(event: MouseEvent): void {
    if (this.isAcarStationOnMap && this.acarMarkers.length > 0) {
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
    if (this.isAirportOnMap && this.airportMarkers.length > 0) {
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
    if (this.isVdlStationOnMap && this.vdlMarkers.length > 0) {
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

  public addAcarStationLayer(event: MouseEvent): void {
    if (this.canvasmarkerLayers && !this.isAcarStationOnMap) {
      this.canvasmarkerLayers.addLayers(this.acarMarkers);
      this.isAcarStationOnMap = true;
    } else {
      alert(`canvas not exists or acar stations have already been added to map`);
    }
  }

  public addAirportStationLayer(event: MouseEvent): void {
    if (this.canvasmarkerLayers && !this.isAirportOnMap) {
      this.canvasmarkerLayers.addLayers(this.airportMarkers);
      this.isAirportOnMap = true;
    } else {
      alert(`canvas not exists or airports have already been added to map`);
    }

  }

  public addVdlStationLayer(event: MouseEvent): void {
    if (this.canvasmarkerLayers && !this.isVdlStationOnMap) {
      this.canvasmarkerLayers.addLayers(this.vdlMarkers);
      this.isVdlStationOnMap = true;
    } else {
      alert(`canvas not exists or vdl stations have already been added to map`);
    }
  }

  public removeAcarStationLayer(event: MouseEvent) {
    if (this.isAcarStationOnMap) {
      this.acarMarkers.forEach((marker: L.Marker) => {
          marker.closePopup();
          marker.closeTooltip();
          this.canvasmarkerLayers.removeMarker(marker, true);
        }
      );
      this.isAcarStationOnMap = false;
    } else {
      alert('acarstation is not on map');
    }

    if (this.leafletMap && this.acarStationCircleTracker.size > 0) {
      this.acarStationCircleTracker.forEach((value, key) => {
        this.leafletMap.removeLayer(value);
      });
      this.acarStationCircleTracker.clear();
    }
  }

  public removeAirportStationLayer(event: MouseEvent) {
    if (this.isAirportOnMap) {
      this.airportMarkers.forEach((marker: L.Marker) => {
          marker.closePopup();
          marker.closeTooltip();
          this.canvasmarkerLayers.removeMarker(marker, true);
        }
      );
      this.isAirportOnMap = false;
    } else {
      alert('airport is not on map');
    }
    if (this.leafletMap && this.airportCircleTracker.size > 0) {
      this.airportCircleTracker.forEach((value, key) => {
        this.leafletMap.removeLayer(value);
      });
      this.airportCircleTracker.clear();
    }
  }

  public removeVdlStationLayer(event: MouseEvent) {
    if (this.isVdlStationOnMap) {
      this.vdlMarkers.forEach((marker) => {
          marker.closePopup();
          marker.closeTooltip();
          this.canvasmarkerLayers.removeMarker(marker, true);
        }
      );
      this.isVdlStationOnMap = false;
    } else {
      alert('vdl station is not on map');
    }
    if (this.leafletMap && this.vdlStationCircleTracker.size > 0) {
      this.vdlStationCircleTracker.forEach((value, key) => {
        this.leafletMap.removeLayer(value);
      });
      this.vdlStationCircleTracker.clear();
    }
  }

  public drawFlightRoute(event: MouseEvent) {
    const line = L.polyline([this.flightRoutes[0].wayPoints[0].coords, this.flightRoutes[0].wayPoints[1].coords, this.flightRoutes[0].wayPoints[2].coords]).addTo(this.leafletMap);
    line.setText(`from ${this.flightRoutes[0].vias[0]} via ${this.flightRoutes[0].vias[1]} to ${this.flightRoutes[0].vias[2]}`,
      {
        center: true,
        below: true,
        offset: 10,
        orientation: 'flip'
      });
    const message = `
      I am an Aircraft <br>
      iata: ${this.flightRoutes[0].iata} <br>
      flightNumber: ${this.flightRoutes[0].flightNumber} <br>
      aircraftType: ${this.flightRoutes[0].aircraftType} <br>
      aircraftRegistration: ${this.flightRoutes[0].aircraftRegistration} <br>
      originAirport: ${this.flightRoutes[0].originAirport} <br>
      destinationAirport: ${this.flightRoutes[0].destinationAirport} <br>
      vias: ${this.flightRoutes[0].vias[0]}, ${this.flightRoutes[0].vias[1]},${this.flightRoutes[0].vias[2]}  <br>
      altitude: ${this.flightRoutes[0].altitude} <br>
      speed: ${this.flightRoutes[0].speed} KM/H <br>
      country: ${this.flightRoutes[0].countryCode}
    `;
    //line.bindPopup(message);
    this.flightPolyline = L.motion.polyline([this.flightRoutes[0].wayPoints[0].coords, this.flightRoutes[0].wayPoints[1].coords, this.flightRoutes[0].wayPoints[2].coords], {
        color: 'red'
      },
      {
        speed: this.flightRoutes[0].speed
      },
      {
        removeOnEnd: true,
        icon: L.divIcon({
          html: `<i class="airpline-solid" motion-base="-45"></i>`,
          iconSize: L.point(24, 24)
        })
      });
    this.flightPolyline.bindPopup(message);
    this.flightRouteSequenceGroup = L.motion.seq([
      this.flightPolyline
    ]).addTo(this.leafletMap);


    this.flightRouteSequenceGroup.motionStart();
    this.flightRouteSequenceGroup.on(L.Motion.Event.Started, (e) => {
      this.flightPolyline.setText(`from ${this.flightRoutes[0].vias[0]} via ${this.flightRoutes[0].vias[1]} to ${this.flightRoutes[0].vias[2]}`);
      console.log();
      }
    );
    this.flightRouteSequenceGroup.on(L.Motion.Event.Ended, (e) => {
        this.isCurrentFlightMotionEnd = true;
        console.log(e);
      }
    );
  }

  public RemoveFlightRoute(event: MouseEvent) {
    if (this.flightPolyline && this.isCurrentFlightMotionEnd) {
      this.leafletMap.removeLayer(this.flightRouteSequenceGroup);
      this.isCurrentFlightMotionEnd = false;
    } else {
      alert('flight in on the way cannot remove the route');
    }
  }

  public onMapReady(map: L.Map): void {
    this.leafletMap = map ? map : undefined;
    this.setAcarStationLayerFromGeoJson();
    this.setAirportLayerFromGeoJson();
    this.setVdlStationLayerFromGeoJson();
    this.initializeCanvasMarker();

  }

  private setMarkerTooltip(markerToolips: Array<IMarkerTooltip>): void {

  }

  private initializeCanvasMarker(): void {
    this.canvasmarkerLayers = L.canvasIconLayer({}).addTo(this.leafletMap);
    this.canvasmarkerLayers.addLayer(new L.Marker([0, 0], {
      icon: new L.Icon({
        iconUrl: '',
        iconSize: [0, 0],
        // To make the leaflet canvas marker working properly, we had to provide icon anchor
        iconAnchor: [0, 0]
      })
    }));
  }

  private setAcarStationLayerFromGeoJson(): void {
    this.acarstationGeoLayers = L.geoJSON(this.acarStationGeoJsonData, {
        pointToLayer: (geoJsonPoint, latlng): L.Layer => {
          const marker = new L.Marker(latlng, this.acarStationMakerOption).bindTooltip('', {
            permanent: true,
            direction: 'bottom'
          });
          this.acarMarkersTootips.push(
            {
              marker: marker,
              latLng: latlng,
              geoJsonPoint: geoJsonPoint
            }
          );
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
          const marker = new L.Marker(latlng, this.airportMakerOption).bindTooltip('', {
            permanent: true,
            direction: 'bottom'
          });
          this.airportMarkersTootips.push(
            {
              marker: marker,
              latLng: latlng,
              geoJsonPoint: geoJsonPoint
            }
          );
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
            Country: ${feature.properties.country} 
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
          const marker = new L.Marker(latlng, this.vdlStationMakerOption).bindTooltip('', {
            permanent: true,
            direction: 'bottom'
          });
          this.vdlMarkersTootips.push(
            {
              marker: marker,
              latLng: latlng,
              geoJsonPoint: geoJsonPoint
            }
          );
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
