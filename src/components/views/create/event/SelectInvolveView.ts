/// <reference path="../../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  @parentView('CreateEventView')
  class SelectInvolveView extends View {

    public ViewName = 'SelectInvolveView';
    public members: {
      [index: string]: IMemberData;
    };

    private projectId: string;

    constructor() {
      super();
      this.zone.run(() => {
        this.projectId = this.$state.params._id;
      });
    }

    public onAllChangesDone() {
      this.members = this.parent.members;
    }

    public selectExecutor(id: string) {
      this.members[id].isSelected = !this.members[id].isSelected;
    }
  }

  angular.module('teambition').controller('SelectInvolveView', SelectInvolveView);
}
