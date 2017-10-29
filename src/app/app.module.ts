import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { NavigationBarComponent } from './navigation-bar/navigation-bar.component';
import { StartPageComponent } from './start-page/start-page.component';
import { RouterModule, Routes } from '@angular/router';
import { TimetableComponent } from './timetable/timetable.component';
import { FreeRoomsComponent } from './freerooms/freerooms.component';
import { HolidaysComponent } from './holidays/holidays.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UntisFetcherService } from './untis-fetcher/untis-fetcher.service';
import { CookieService } from 'ngx-cookie-service';
import { VipComponent } from './vip/vip.component';

const appRoutes: Routes = [
  { path: '', component: TimetableComponent },
  { path: 'timetable', component: TimetableComponent },
  { path: 'freerooms', component: FreeRoomsComponent },
  { path: 'holidays', component: HolidaysComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    NavigationBarComponent,
    StartPageComponent,
    TimetableComponent,
    FreeRoomsComponent,
    HolidaysComponent,
    VipComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    NgbModule.forRoot(),
    HttpModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false }
    )
  ],
  providers: [UntisFetcherService, CookieService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
