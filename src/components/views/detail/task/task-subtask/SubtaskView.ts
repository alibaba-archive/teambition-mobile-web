/// <reference path="../../../../interface/teambition.d.ts" />
module teambition {
  'use strict';
  @parentView('TaskView')
  class SubtaskView extends View {

    public ViewName = 'SubtaskView';
    public subtasks: ISubtaskData[];

    private subtasksAPI: ISubtasksAPI;
    private detailAPI: IDetailAPI;
    // @ngInject
    constructor(
      detailAPI: IDetailAPI,
      subtasksAPI: ISubtasksAPI
    ) {
      super();
      this.subtasksAPI = subtasksAPI;
      this.detailAPI = detailAPI;
      this.zone.run(noop);
    }

    public onInit() {
      let taskId: string;
      if (this.parent) {
        taskId = this.parent.task._id;
      }else {
        taskId = this.$state.params._id;
      }
      return this.subtasksAPI.fetch(taskId)
      .then((data: ISubtaskData[]) => {
        this.subtasks = data;
      });
    }
  }

  angular.module('teambition').controller('SubtaskView', SubtaskView);
}
