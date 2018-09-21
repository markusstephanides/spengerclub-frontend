import { UntisFetcherService } from '../untis-fetcher/untis-fetcher.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import { Observable } from 'rxjs/Observable';
import { Component } from '@angular/core';
import * as moment from 'moment';
import _ from 'lodash';
import { CookieService } from 'ngx-cookie-service';

@Component({
  templateUrl: './timetable.component.html',
  providers: [UntisFetcherService],
  styleUrls: ['./timetable.component.css']
})
export class TimetableComponent {

  public timetable: any;
  public typeSelect: String;
  public definitions: any;
  public typeAheadList: any[];
  public days: any[];
  public detailSelect: any;
  public currentLesson: any;
  public lastUpdated: string;
  public nextWeek: boolean;
  public timetableLoaded: boolean;
  public lastImportTime: any;

  private lessonInfos: any;
  private activeAutoload: any;
  private currentItem: any;
  private currentlySaved: any;
  private holidays: any;

  public bannerHide:boolean;

  constructor(public units: UntisFetcherService, private cookieService: CookieService) {
    this.timetable = [];
    this.nextWeek = false;
    this.timetableLoaded = false;

    this.lessonInfos = [{ start: '8:00', end: '8:50' },
    { start: '8:50', end: '9:40' }, { start: '9:55', end: '10:45' }, { start: '10:45', end: '11:35' }, {
      start: '11:45',
      end: '12:35'
    },
    { start: '12:35', end: '13:25' }, { start: '13:25', end: '14:15' }, { start: '14:25', end: '15:15' }, {
      start: '15:15',
      end: '16:05'
    },
    { start: '16:15', end: '17:05' }, { start: '17:10', end: '17:55' }, { start: '17:55', end: '18:40' }, {
      start: '18:50',
      end: '19:35'
    },
    { start: '19:35', end: '20:20' }, { start: '20:30', end: '21:15' }, { start: '21:15', end: '22:00' }];

    const activeLessonRefresh = function() {
      this.loadCurrentLesson();
    }.bind(this);

    this.loadCurrentLesson();

    setInterval(activeLessonRefresh, 1000 * 60);

    units.getHolidays().subscribe((response) => {
      response.forEach(hol => {
        hol.longName = hol.longName.replace('schulautonomer', 'Schulautonome').replace('schulautonome', 'Schulautonome');
        hol.startDate = this.parse(hol.startDate + '');
        hol.endDate = this.parse(hol.endDate + '');

      });
      this.holidays = response;
    });

    units.getAllDefinitions().subscribe((response) => {
      for (let z = 0; z < Object.keys(response).length; ++z) {
        const currKey = Object.keys(response)[z];
        for (let i = 0; i < Object.keys(response[currKey]).length; ++i) {
          const currEl = Object.keys(response[currKey])[i];
          const curr = response[currKey][currEl];
          if (Object.keys(response)[z] === 'teachers') {
            curr.searchName = curr.displayname;
          } else {
            curr.searchName = curr.name;
          }
        }
      }
      this.definitions = response;
      this.typeSelect = 'classes';
      this.loadList(null);
      this.loadTimetable();
    });
  }

  private loadDays() {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    if (this.nextWeek) {
      date.setDate(date.getDate() + 7);
    }
    const day = date.getDay();
    const array = [];
    const dates = [];

    const toStr = (date_) => {
      return (date_.getDate() < 10 ? '0' + date_.getDate() : date_.getDate()) + '.' +
        ((date_.getMonth() + 1) < 10 ? '0' + (date_.getMonth() + 1) : date_.getMonth() + 1) + '.' + date_.getFullYear();
    };

    const toDayName = (date_) => {
      return ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'][date_.getDay()];
    };

    for (let i = 1; i < 7; i++) {
      if (i - day !== 0) {
        const days = i - day;
        const newDate = new Date(date.getTime() + (days * 24 * 60 * 60 * 1000));

        const newObj = { date: toStr(newDate), day: toDayName(newDate), holidayName: undefined };

        newObj.holidayName = this.getHoliday(newDate);
        dates.push(newObj);
      } else {
        const newObj = { date: toStr(date), day: toDayName(date), holidayName: undefined };
        newObj.holidayName = this.getHoliday(date);
        dates.push(newObj);
      }
    }

    this.days = dates;
  }

  public getHoliday(date: Date) {
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);

    for (let i = 0; i < this.holidays.length; ++i) {
      const holiday = this.holidays[i];

      if ((this.compareDates(date, holiday.startDate) === 1 && this.compareDates(date, holiday.endDate) === -1)
        || (date.getFullYear() === holiday.startDate.getFullYear() && date.getMonth() === holiday.startDate.getMonth() &&
          date.getDate() === holiday.startDate.getDate())) {
        return holiday.longName;
      }
    }
  }

  private compareDates(date1: Date, date2: Date) { // -1 = date1 <= date2 ; 1 = date1 >= date2
    if (date1.getFullYear() <= date2.getFullYear() &&
      date1.getMonth() <= date2.getMonth() &&
      date1.getDate() <= date2.getDate()) {
      return -1;
    } else if (date1.getFullYear() >= date2.getFullYear() &&
      date1.getMonth() >= date2.getMonth() &&
      date1.getDate() >= date2.getDate()) {
      return 1;
    } else {
      return 0;
    }
  }

  public closeBanner() {
      this.bannerHide = true;
  }

  public changeWeek() {
    this.nextWeek = !this.nextWeek;
    this.loadTimetable(this.currentItem);
  }

  public getLessonInfo(lesson: any) {
    for (let i = 0; i < this.timetable.length; ++i) {
      if (this.timetable[i] === lesson) {
        return { number: i + 1, start: this.lessonInfos[i].start, end: this.lessonInfos[i].end };
      }
    }
  }

  public loadList(event: any) {
    this.detailSelect = '';
    this.timetableLoaded = false;
    this.timetable = undefined;
    this.typeAheadList = this.definitions[this.typeSelect.toString()];
    this.nextWeek = false;
  }

  public getCurrClass(unit: any) {
    if (!this.currentLesson || Object.keys(this.currentLesson).length === 0) {
      return '';
    }

    return unit.length > 0 && unit[0][0].startTime === this.currentLesson.startTime &&
     unit[0][0].date === parseInt(this.currentLesson.date, 10)
      ? 'current-lesson' : '';
  }

  public getCurrLessonClass(lesson: any) {
    // for (var i = 0; i < this.lessonInfos.length; ++i) {
    //   if(this.lessonInfos[i].start == lesson.start && this.currentLesson.number == (i+1)){
    //       return 'current-lesson';
    //   }
    // }

    return '';
  }

  public loadTimetable(item?: any, autoreloaded?: boolean) {
    clearInterval(this.activeAutoload);

    let reqItem;

    if (!item && this.currentItem) {
      reqItem = this.currentItem;
    } else if (!item && this.cookieService.check('spengercookie')) {
      reqItem = JSON.parse(this.cookieService.get('spengercookie'));
      if (reqItem && !autoreloaded) {
        this.currentlySaved = reqItem.id;
        this.typeSelect = reqItem.type;
        this.typeAheadList = this.definitions[this.typeSelect.toString()];
        const items = this.definitions[this.typeSelect.toString()];
        const itemNames = Object.keys(items);

        for (let i = 0; i < itemNames.length; ++i) {
          const curr = items[itemNames[i]];

          if (curr.name === reqItem.name) {
            this.detailSelect = curr;
          }
        }
      }
    } else if (item) {
      reqItem = { id: item.id, name: item.name, type: this.typeSelect };
    }

    if (!reqItem) {
      return;
    }

    this.units.getTimeTableData(reqItem, this.nextWeek)
      .subscribe((timetableData) => {
        if (!this.timetableLoaded && autoreloaded) {
          return;
        }

        if (!timetableData || timetableData.length === 0) {
          this.timetable = undefined;
        }

        this.timetable = timetableData;
        this.lastUpdated = 'Zuletzt aktualisiert um ' + this.getTime() + ' Uhr';
        this.currentItem = reqItem;
        this.loadDays();
        this.timetableLoaded = true;

        this.units.getLastUntisUpdate().subscribe(lastUpdateTime => {
          this.lastImportTime = new Date(lastUpdateTime);
        });
      });

    this.activeAutoload = setInterval(function() { this.loadTimetable(undefined, true); }.bind(this), 1000 * 60);
  }

  public setAsDefault() {
    if (!this.timetableLoaded) {
      return;
    }

    const inOneYear = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
    const reqItem = { id: this.currentItem.id, name: this.currentItem.name, type: this.typeSelect };
    this.currentlySaved = reqItem.id;
    this.cookieService.set('spengercookie', JSON.stringify(reqItem), inOneYear);
  }

  public currTTIsSaved() {
    return this.currentItem !== undefined && this.currentlySaved === this.currentItem.id;
  }

  public getTime() {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();

    return (h < 10 ? '0' + h : h.toString()) + ':' + (m < 10 ? '0' + m : m + '');
  }

  public onSelectItem(item: any) {
    this.nextWeek = false;
    this.timetableLoaded = false;
    this.currentItem = item;
    this.loadTimetable(item);
  }

  public loadCurrentLesson() {
    this.units.getCurrentLesson()
      .subscribe((currLesson) => {
        this.currentLesson = currLesson;
      });
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

  public isIrregular(child: any) {
    return !child.subject || !child.teacher || child.code === 'irregular';
  }

  public isCancelled(child: any) {
    return child.code === 'cancelled';
  }

  search = (text$: Observable<string>) =>
    text$
      .debounceTime(200)
      .map(term => term === '' ? [] :
        Object.keys(this.typeAheadList).map((key) => {
          return this.typeAheadList[key];
        }).filter(v => v.searchName.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))

  formatter = (x) => x.name;
}
