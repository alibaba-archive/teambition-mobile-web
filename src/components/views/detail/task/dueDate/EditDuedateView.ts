/// <reference path="../../../../interface/teambition.d.ts" />
module teambition {
  'use strict';
  @inject([
    'DetailAPI'
  ])
  class EditDuedateView extends View {
    public ViewName = 'EditDuedateView';
    public task: ITaskDataParsed;

    private DetailAPI: IDetailAPI;
    private taskid: string;
    constructor() {
      super();
      this.zone.run(() => {
        this.taskid = this.$state.params._id;
      });
    }

    public onInit() {
      return this.DetailAPI.fetch(this.taskid, 'task')
      .then((task: ITaskDataParsed) => {
        this.task = task;
      });
    }
  }

  angular.module('teambition').controller('EditDuedateView', EditDuedateView);
}
