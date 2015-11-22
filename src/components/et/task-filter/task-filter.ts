/// <reference path="../../interface/teambition.d.ts" />
module EtTemplate {
  'use strict';

  let dropDownTimer: number;
  let removeTimer: number;

  @Component({
    templateUrl: 'et/task-filter/index',
    selector: 'body',
    lazy: true
  })
  @teambition.inject([
    '$ionicBackdrop'
  ])
  export class TaskFilter extends ETComponent {

    public animateClass: string;
    public taskListGroup: Array<teambition.ITasklistData>;
    public selectedTaskList: teambition.ITasklistData;
    private $ionicBackdrop: ionic.backdrop.IonicBackdropService;

    public show(scope: any) {
      window.clearTimeout(dropDownTimer);
      window.clearTimeout(removeTimer);
      this.$ionicBackdrop.release();
      this.animateClass = 'slideInDown';
      this.bindContext(scope);
      this.insertDOM();
      this.$ionicBackdrop.retain();
      return this;
    }

    public close(e?: Event) {
      if (e) {
        e.stopPropagation();
      }
      this.animateClass = 'slideOutUp';
      dropDownTimer = setTimeout(() => {
        this.$ionicBackdrop.release();
      }, 200);
      removeTimer = setTimeout(() => {
        this.remove();
      }, 400);

    }
  }

  angular.module('et.template').service('taskFilter', TaskFilter);
}
