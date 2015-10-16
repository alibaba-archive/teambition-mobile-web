/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';
  @parentView('DetailView')
  class ActivityView extends View {

    public ViewName = 'ActivityView';

    public activities: IActivityDataParsed[];

    private activityAPI: IActivityAPI;

    // @ngInject
    constructor(
      activityAPI: IActivityAPI
    ) {
      super();
      this.activityAPI = activityAPI;
      this.zone.run(noop);
    }

    onInit() {
      let _boundToObjectType = this.parent._boundToObjectType;
      let _boundToObjectId = this.parent._boundToObjectId;
      return this.activityAPI.fetch(_boundToObjectType, _boundToObjectId)
      .then((activities: IActivityDataParsed[]) => {
        this.activities = activities;
      });
    }
  }

  angular.module('teambition').controller('ActivityView', ActivityView);
}
