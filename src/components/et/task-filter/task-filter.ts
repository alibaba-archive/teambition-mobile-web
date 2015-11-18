/// <reference path="../../interface/teambition.d.ts" />
module EtTemplate {
  'use strict';

  @Component({
    templateUrl: 'et/task-filter/index',
    selector: 'body'
  })
  export class TaskFilter extends ETComponent {

    public animateClass: string;
    public taskListGroup: Array<teambition.ITasklistData>;
    public selectedTaskList: teambition.ITasklistData;
    private taskListView: teambition.PanelTasklistView;

    constructor() {
      super();
      this.zone.run(teambition.noop);
    }

    public show(taskListView_: teambition.PanelTasklistView) {
      this.animateClass = 'animated slideInDown';
      this.taskListView = taskListView_;
      this.taskListGroup = taskListView_.tasklists;
      this.selectedTaskList = taskListView_.tasklistSelected;
      this.taskListGroup.forEach((element: teambition.ITasklistData) => {
        this[`click_${element._id}`] = () => {
          this.select_filter(element._id);
        };
      });

      ['smart_not_assigned', 'smart_not_done', 'smart_done']
      .forEach((e: string) => {
        this[`click_${e}`] = () => {
          console.log(e);
          this.taskListView.chooseSmartlist(e.replace('_', '-'));
          this.close_filter();
        };
      });

      this.insertDOM();
    }

    public select_filter(id: string) {
      this.taskListView.chooseTasklist(id);
      this.close_filter();
    }

    public close_filter() {
      this.animateClass = 'animated slideOutUp';
      setTimeout(() => {
        this.remove();
        this.taskListView.closeFilter();
      }, 200);
    }
  }

  angular.module('et.template').service('taskFilter', TaskFilter);
}
