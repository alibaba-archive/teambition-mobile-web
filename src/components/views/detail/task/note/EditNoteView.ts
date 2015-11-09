/// <reference path="../../../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  @inject([
    'DetailAPI'
  ])
  class EditNoteView extends View {
    public ViewName = 'EditNoteView';

    public task: ITaskData;

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
      .then((task: ITaskData) => {
        this.task = task;
      });
    }

  }

  angular.module('teambition').controller('EditNoteView', EditNoteView);
}
