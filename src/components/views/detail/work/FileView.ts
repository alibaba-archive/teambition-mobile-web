/// <reference path="../../../interface/teambition.d.ts" />
module teambition {
  'use strict';
  @parentView('DetailView')
  class FileView extends View {

    public ViewName = 'FileView';

    public file: IFileDataParsed;

    constructor() {
      super();
      this.zone.run(noop);
    }

    public onInit() {
      return this.parent.onInit();
    }

    public onAllChangesDone() {
      this.file = this.parent.detail;
    }
  }

  angular.module('teambition').controller('FileView', FileView);
}
