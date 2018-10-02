import { UntisFetcherService } from '../untis-fetcher/untis-fetcher.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import { Observable } from 'rxjs/Observable';
import { Component, ChangeDetectionStrategy, ViewChild, TemplateRef } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent } from 'angular-calendar';
import * as moment from 'moment';
import _ from 'lodash';
import { Title } from '@angular/platform-browser';

@Component({
  templateUrl: './freerooms.component.html',
  providers: [UntisFetcherService],
  styles: [`.push-up {
    margin-top: 2em;
  }`]
})
export class FreeRoomsComponent {

  public freeRooms: any;

  constructor(public api: UntisFetcherService, private titleService: Title) {
    api.getFreeRooms().subscribe((response) => {
      response.date = new Date(response.date);
      this.freeRooms = response;
    });
    this.titleService.setTitle("Freie Räume - spenger.club" );
  }

  public getAdditional(freeRoom: any) {
    return freeRoom.additionalHours > 0 ? '( +' + freeRoom.additionalHours + (freeRoom.additionalHours > 1 ? ' Stunden)' : ' Stunde)') : '';
  }

}
