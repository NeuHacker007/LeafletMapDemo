import {acarsGroundStations} from '../MapData';
import {AsimsDataSourceService} from './asims-data-source.service';

/**
 * A service that provides ACARS Ground Station data provided by ASIMS.
 *
 * Created by Christopher E. Ciemier
 */
export class AsimsAcarsService extends AsimsDataSourceService {
  constructor() {
    super(acarsGroundStations);
  }
}
