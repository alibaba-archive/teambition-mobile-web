import {Component, ETComponent} from '../../bases/ETComponents';
'use strict';

let fadeOutAnimate: number;
let removeFn: number;

@Component({
  templateUrl: 'et/notify/index',
  selector: 'body'
})
export class Notify extends ETComponent {

  public type: string;
  public title: string;
  public msg: string;
  public href: string;
  public animateClass: string;

  public test: any;

  constructor() {
    super();
    this.zone.run(angular.noop);
  }

  public show(type: string, title: string, msg: string, href?: string) {
    this.type = type;
    this.title = title;
    this.msg = msg;
    this.href = href;
    window.clearTimeout(fadeOutAnimate);
    window.clearTimeout(removeFn);
    this.animateClass = 'animated fadeInUp';
    this.insertDOM();
    fadeOutAnimate = window.setTimeout(() => {
      this.animateClass = 'animated fadeOutDown';
    }, 2000);

    removeFn = window.setTimeout(() => {
      this.animateClass = null;
      this.remove();
    }, 3000);

  }
}
