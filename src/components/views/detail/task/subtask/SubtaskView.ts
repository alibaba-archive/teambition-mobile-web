/// <reference path="../../../../interface/teambition.d.ts" />
module teambition {
  'use strict';
  @inject([
    'SubtasksAPI'
  ])
  class SubtaskView extends View {

    public ViewName = 'SubtaskView';
    public subtasks: ISubtaskData[];

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
  }

  angular.module('teambition').controller('SubtaskView', SubtaskView);
}
