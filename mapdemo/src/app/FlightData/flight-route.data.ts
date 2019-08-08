import {IFlightRoute} from "./flight-route.interface";

export const flightRoutes: Array<IFlightRoute> = [
    {
      iata: 'AAL',
      flightNumber: '1234',
      aircraftType: 'Airbus A320',
      aircraftRegistration: 'PXAUSX',
      originAirport: 'BOS',
      destinationAirport: 'SFO',
      vias: ['BOS', 'BWI', 'SFO'], // order matters
      altitude: 10000,// feet
      speed: 91000,// km/h
      countryCode: 'USA',
      wayPoints: [
        {
          name: 'LOGAN INTL AIRPORT',
          coords:
            {
              lat: 42.3642,
              lng: -71.0057
            }
        },
        {
          name: 'BALTIMORE-WASHINGTON INTERNATIONAL',
          coords:
            {
              lat: 39.1696,
              lng: -76.6786
            }
        },
        {
          name: 'SAN FRANCISCO INTERNATIONAL AIRPORT',
          coords: {
            lat: 37.6191,
            lng: -122.3738
          }
        }
      ]
    }
];
