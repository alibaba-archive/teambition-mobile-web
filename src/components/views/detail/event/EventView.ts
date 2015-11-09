/// <reference path="../../../interface/teambition.d.ts" />
module teambition {
  'use strict';
  @parentView('DetailView')
  class EventView extends View {

    public ViewName = 'EventView';

    public event: IEventData;

    constructor() {
      super();
      this.zone.run(noop);
    }

    public onInit() {
      return this.parent.onInit();
    }

    public onAllChangesDone() {
      this.event = this.parent.detail;
    }
  }

  angular.module('teambition').controller('EventView', EventView);
}
