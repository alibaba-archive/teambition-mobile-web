/// <reference path="../../../interface/teambition.d.ts" />
module teambition {
  'use strict';
  @parentView('DetailView')
  class TaskView extends View {

    public ViewName = 'TaskView';

    public task: ITaskDataParsed;
    public project: IProjectDataParsed;

    constructor() {
      super();
      this.zone.run(noop);
    }

    public onAllChangesDone() {
      this.task = this.parent.detail;
      this.project = this.parent.project;
    }

    public openSubtasks () {
      if (this.task.subtaskCount) {
        window.location.hash = `/detail/task/${this.task._id}/subtasks`;
      }
    }

  }

  angular.module('teambition').controller('TaskView', TaskView);
}
