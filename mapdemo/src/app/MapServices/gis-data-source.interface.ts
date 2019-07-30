import {FeatureCollection} from 'geojson';
import {Observable} from 'rxjs';

/**
 * This interface enforces the API required to access GIS data services.
 *
 * Created by Gianni Xipolitidis
 */
export interface IGISDataSource {
  /**
   * Gets the observable associated with a GIS Feature Collection.
   */
  getData(): Observable<FeatureCollection>;
}
