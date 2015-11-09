/// <reference path="../../../../interface/teambition.d.ts" />
module teambition {
  'use strict';
  class EditPriorityView extends View {

    public ViewName = 'EditPriorityView';

    private taskid: string;

    constructor() {
      super();
      this.zone.run(() => {
        this.taskid = this.$state.params._id;
      });
    }
  }

  angular.module('teambition').controller('EditPriorityView', EditPriorityView);
}
