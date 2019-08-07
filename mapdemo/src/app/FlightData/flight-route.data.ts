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
      speed: 910000,// km/h
      countryCode: 'USA',
      wayPoints: [
        {
          name: 'LOGAN INTL AIRPORT',
          coords: [42.3642, -71.0057]
        },
        {
          name: 'BALTIMORE-WASHINGTON INTERNATIONAL',
          coords: [38.3405, -75.5103]
        },
        {
          name: 'SAN FRANCISCO INTERNATIONAL AIRPORT',
          coords: [37.6191, -122.3738]
        }
      ]
    }
  ]
;
