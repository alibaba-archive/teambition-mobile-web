/// <reference path="../../../../interface/teambition.d.ts" />
module teambition {
  'use strict';
  @parentView('TaskView')
  @inject([
    'SubtasksAPI'
  ])
  class SubtaskView extends View {

    public ViewName = 'SubtaskView';
    public subtasks: ISubtaskData[];

    private SubtasksAPI: ISubtasksAPI;

    constructor() {
      super();
      this.zone.run(noop);
    }

    public onInit() {
      let taskId: string;
      if (this.parent) {
        taskId = this.parent.task._id;
      }else {
        taskId = this.$state.params._id;
      }
      return this.SubtasksAPI.fetch(taskId)
      .then((data: ISubtaskData[]) => {
        this.subtasks = data;
        console.log(this.subtasks);
      });
    }
  }

  angular.module('teambition').controller('SubtaskView', SubtaskView);
}
