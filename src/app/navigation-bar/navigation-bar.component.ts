import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html'
})
export class NavigationBarComponent implements OnInit {

  public links: any[];

  constructor() {
  }

  ngOnInit() {
    this.links = [
      { path: '', name: 'Stundenplan' },
      { path: '/freerooms', name: 'Freie Räume' },
      { path: '/holidays', name: 'Schulfreie Tage' }
    ];
  }

}
