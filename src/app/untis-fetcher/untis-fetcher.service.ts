import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class UntisFetcherService {

  public typeNumber: any = { 'classes': 1, 'teachers': 2, 'subject': 3, 'rooms': 4 };

  constructor(private http: Http) {
  }

  public getAllDefinitions() {
    return this.httpRequest('/endpoint/definitions', {
      'type': 'all',
      'mode': 'byId'
    });
  }

  public getFreeRooms() {
    return this.httpRequest('/endpoint/freerooms', {});
  }

  public getLastUntisUpdate() {
    return this.httpRequest('/endpoint/lastimport', {});
  }

  public getHolidays() {
    return this.httpRequest('/endpoint/holidays', {});
  }

  public getCurrentLesson() {
    return this.httpRequest('/endpoint/currentlesson', {});
  }

  public getTimeTableData(requestData: any, nextWeek: boolean) {
    return this.httpRequest('/endpoint/timetable', {
      'type': this.typeNumber[requestData.type],
      'nextWeek': nextWeek,
      'id': requestData.id,
      'threedee': true
    });
  }

  private httpRequest(url: string, body: any) {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const options = new RequestOptions({ headers: headers });
    return this.http.post(url, body, options)
      .map(this.extractData);
  }

  private extractData(res: Response) {
    return res.json() || {};
  }
}
