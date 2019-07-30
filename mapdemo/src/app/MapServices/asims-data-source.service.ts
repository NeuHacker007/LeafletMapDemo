import {IGISDataSource} from './gis-data-source.interface';
import {FeatureCollection} from 'geojson';
import {Observable, BehaviorSubject, Subject} from 'rxjs';
import {Injectable} from '@angular/core';

/**
 * An abstract service that supports ASIMS data sources.  It allows for the initialization of
 * a Behavior Subject from a GIS Feature Collection.
 *
 * Created by Christopher E. Ciemier
 */
@Injectable()
export abstract class AsimsDataSourceService implements IGISDataSource {
  /**
   * The data subject.
   */
  protected readonly data$: Subject<FeatureCollection>;

  /**
   * The constructor.
   * @param featureCollection The feature collection to emit.
   */
  constructor(featureCollection: FeatureCollection) {
    this.data$ = new BehaviorSubject(featureCollection);
  }

  /**
   * Gets the data observable.
   */
  getData(): Observable<FeatureCollection> {
    return this.data$;
  }
}
