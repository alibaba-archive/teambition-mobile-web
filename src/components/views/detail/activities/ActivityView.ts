/// <reference path="../../../interface/teambition.d.ts" />
module teambition {
  'use strict';
  @parentView('DetailView')
  @inject([
    'ActivityAPI'
  ])
  class ActivityView extends View {

    public ViewName = 'ActivityView';

    public activities: IActivityDataParsed[];

    private ActivityAPI: IActivityAPI;

    constructor() {
      super();
      this.zone.run(noop);
    }

    public onInit() {
      let _boundToObjectType = this.parent._boundToObjectType;
      let _boundToObjectId = this.parent._boundToObjectId;
      return this.ActivityAPI.fetch(_boundToObjectType, _boundToObjectId)
      .then((activities: IActivityDataParsed[]) => {
        this.activities = activities;
      });
    }

    public openDetail(linked: any) {
      if (linked) {
        window.location.hash = `/detail/${linked.objectType}/${linked._objectId}`;
      }
    }
  }

  angular.module('teambition').controller('ActivityView', ActivityView);
}
