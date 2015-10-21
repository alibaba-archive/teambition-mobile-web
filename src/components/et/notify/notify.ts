/// <reference path="../../interface/teambition.d.ts" />
module EtTemplate {
  'use strict';

  let fadeOutAnimate: number;
  let removeFn: number;

  @Component({
    templateUrl: 'et/notify/index',
    selector: 'body'
  })
  export class Notify extends ETComponent {

    public show(type: string, title: string, msg: string, href?: string) {
      let param = {
        type: type,
        title: title,
        msg: msg,
        animateClass: 'animated fadeInUp',
        href: href
      };
      window.clearTimeout(fadeOutAnimate);
      window.clearTimeout(removeFn);
      this.remove();
      this.update(param);
      this.insertDOM();
      fadeOutAnimate = setTimeout(() => {
        param.animateClass = 'animated fadeOutDown';
        this.update(param);
      }, 2000);

      removeFn = setTimeout(() => {
        this.remove();
      }, 3000);

    }
  }

  angular.module('et.template').service('notify', Notify);
}
