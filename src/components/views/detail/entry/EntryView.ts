/// <reference path="../../../interface/teambition.d.ts" />
module teambition {
  'use strict';
  @parentView('DetailView')
  class EntryView extends View {

    public ViewName = 'EntryView';

    public entry: IEntryData;

    constructor() {
      super();
      this.zone.run(noop);
    }

    public onAllChangesDone() {
      this.entry = this.parent.detail;
    }
  }

  angular.module('teambition').controller('EntryView', EntryView);
}
