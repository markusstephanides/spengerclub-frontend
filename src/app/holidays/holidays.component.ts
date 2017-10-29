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

@Component({
  templateUrl: './holidays.component.html',
  providers: [UntisFetcherService],
  styleUrls: ['./holidays.component.css']
})
export class HolidaysComponent {

  public holidays: any;

  constructor(public api: UntisFetcherService) {
    api.getHolidays().subscribe((response) => {
      const toDelete = [];

      response.forEach(hol => {
        const startDate = this.parse(hol.startDate + '');
        const endDate = this.parse(hol.endDate + '');

        hol.longName = hol.longName.replace('schulautonomer', 'Schulautonome').replace('schulautonome', 'Schulautonome');
        hol.startDate = this.formatDate(startDate);
        hol.endDate = this.formatDate(endDate);
        hol.isInPast = this.checkPast(endDate);

        if (this.checkHidden(startDate)) {
          toDelete.push(hol);
        }
      });

      toDelete.forEach(holToDelete => {
        response.splice(response.indexOf(holToDelete), 1);
      });

      this.holidays = response;
    });
  }

  private formatDate(date: any) {
    const d = new Date(date),
      year = d.getFullYear();

    let month = '' + (d.getMonth() + 1),
      day = '' + d.getDate();

    const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

    day = dayNames[d.getDay()] + ', ' + day;

    if (month.length < 2) {
      month = '0' + month;
    }

    if (day.length < 2) {
      day = '0' + day;
    }

    return [day, month, year].join('.');
  }

  private checkPast(endDate: any) {
    return endDate < new Date();
  }

  private checkHidden(startDate: any) {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 7 * 2);
    return startDate < twoWeeksAgo;
  }

  private parse(str: string) {
    if (!/^(\d){8}$/.test(str)) {
      return 'invalid date';
    }
    const y = str.substr(0, 4),
      m = str.substr(4, 2),
      d = str.substr(6, 2);
    return new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
  }
}
