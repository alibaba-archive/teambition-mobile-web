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

    public onAllChangesDone() {
      this.post = this.parent.detail;
    }
  }

  angular.module('teambition').controller('PostView', PostView);
}
