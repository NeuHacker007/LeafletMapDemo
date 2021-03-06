import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {LeafletModule} from '@asymmetrik/ngx-leaflet';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {AsimsAcarsService, AsimsAirportsService, AsimsVdlService} from "./MapServices";
import {LeafletDrawModule} from "@asymmetrik/ngx-leaflet-draw";
import {FlightRouteService} from "./FlightDataServices";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    LeafletModule.forRoot(),
    LeafletDrawModule.forRoot()
  ],
  providers: [AsimsAcarsService, AsimsAirportsService, AsimsVdlService, FlightRouteService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
