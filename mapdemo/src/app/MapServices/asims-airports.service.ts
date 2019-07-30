import {AsimsDataSourceService} from './asims-data-source.service';
import {airports} from '../MapData';

/**
 * A service that provides Airport data provided by ASIMS.
 *
 * Created by Christopher E. Ciemier
 */
export class AsimsAirportsService extends AsimsDataSourceService {
  constructor() {
    super(airports);
  }
}
