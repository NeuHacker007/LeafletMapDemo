import {AsimsDataSourceService} from './asims-data-source.service';
import {vdlGroundStations} from '../MapData';

/**
 * A service that provides VDL data provided by ASIMS.
 *
 * Created by Christopher E. Ciemier
 */
export class AsimsVdlService extends AsimsDataSourceService {
  constructor() {
    super(vdlGroundStations);
  }
}
