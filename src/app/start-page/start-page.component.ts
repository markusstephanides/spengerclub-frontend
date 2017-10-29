import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-start-page',
  templateUrl: './start-page.component.html',
  styleUrls: ['./start-page.component.css']
})
export class StartPageComponent implements OnInit {

  public threeLink: any[];

  constructor() { }

  ngOnInit() {
    window.location.href = '/timetable';
    this.threeLink = [
      { title: 'Spengerplan', text: 'Mit Spengerplan kannst du deinen aktuellen Stundenplan sofort aufrufen', type: 'card-success' },
      { title: 'Spengercenter', text: 'Auf Spengercenter kannst du Nachhilfe anfordern oder anbieten. Coming soon!', type: 'card-danger' },
      { title: 'ClassBench™', text: 'ClassBench ist dein persönlicher Schul Organisator. Coming soon!', 'type': 'card-danger' }
    ];
  }

}
