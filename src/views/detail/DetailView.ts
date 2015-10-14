/// <reference path="../../scripts/interface/teambition.d.ts" />
module teambition {
  'use strict';

  class DetailView extends View {

    public ViewName = 'DetailView';

    // @ngInject
    constructor() {
      super();
      this.zone.run(noop);
    }
  }
}
