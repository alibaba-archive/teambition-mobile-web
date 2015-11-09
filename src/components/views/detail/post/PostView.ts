/// <reference path="../../../interface/teambition.d.ts" />
module teambition {
  'use strict';
  @parentView('DetailView')
  class PostView extends View {

    public ViewName = 'PostView';

    public post: IPostDataParsed;

    constructor() {
      super();
      this.zone.run(noop);
    }

    public onInit() {
      return this.parent.onInit();
    }

    public onAllChangesDone() {
      this.post = this.parent.detail;
    }
  }

  angular.module('teambition').controller('PostView', PostView);
}
