/// <reference path="../../interface/teambition.d.ts" />
module EtTemplate {
  'use strict';

  let dropDownTimer: number;
  let removeTimer: number;

  @Component({
    templateUrl: 'et/task-filter/index',
    selector: 'body'
  })
  @teambition.inject([
    '$ionicBackdrop'
  ])
  export class TaskFilter extends ETComponent {

    public animateClass: string;
    public taskListGroup: Array<teambition.ITasklistData>;
    public selectedTaskList: teambition.ITasklistData;
    private scope: any;
    private $ionicBackdrop: ionic.backdrop.IonicBackdropService;

    constructor() {
      super();
      this.zone.run(teambition.noop);
    }

    public show(scope: teambition.PanelTasklistView) {
      this.animateClass = 'animated slideInDown';
      this.scope = scope;
      this.taskListGroup = scope.tasklists;
      this.selectedTaskList = scope.tasklistSelected;
      this.insertDOM();
      this.$ionicBackdrop.retain();
    }

    public selectFilter(id: string) {
      window.clearTimeout(dropDownTimer);
      window.clearTimeout(removeTimer);
      this.scope.chooseTasklist(id);
      this.$ionicBackdrop.release();
    }

    public closeFilter(e?: Event) {
      e.stopPropagation();
      this.animateClass = 'animated slideOutUp';
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
