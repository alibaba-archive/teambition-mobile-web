/// <reference path="../../../../interface/teambition.d.ts" />
module teambition {
  'use strict';
  @inject([
    'SubtasksAPI'
  ])
  class SubtaskView extends View {

    public ViewName = 'SubtaskView';
    public subtasks: ISubtaskData[];

    public nobodyUrl = nobodyUrl;

    private SubtasksAPI: ISubtasksAPI;
    private taskid: string;

    constructor() {
      super();
      this.zone.run(() => {
        this.taskid = this.$state.params._id;
      });
    }

    public onInit() {
      return this.SubtasksAPI.fetch(this.taskid)
      .then((data: ISubtaskData[]) => {
        this.subtasks = data;
      });
    }

    public onAllChangesDone() {
      if (Ding) {
        Ding.setRight('增加子任务', true, false, () => {
          window.location.hash = `/detail/task/${this.taskid}/subtasks/create`;
        });
      }
    }
  }

  angular.module('teambition').controller('SubtaskView', SubtaskView);
}
