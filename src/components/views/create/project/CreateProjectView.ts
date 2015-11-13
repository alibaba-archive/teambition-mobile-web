/// <reference path="../../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  @inject([
    'OrganizationAPI'
  ])
  class CreateProjectView extends View {
    public ViewName = 'CreateProjectView';

    public organizations: IOrganizationData[];

    private OrganizationAPI: IOrganizationAPI;

    constructor() {
      super();
      this.zone.run(() => {
        if (Ding) {
          Ding.setLeft('取消', true, true, () => {
            window.history.back();
          });
        }
      });
    }

    public onInit() {
      return this.OrganizationAPI.fetch()
      .then((organizations: IOrganizationData[]) => {
        this.organizations = organizations;
      });
    }

  }

  angular.module('teambition').controller('CreateProjectView', CreateProjectView);
}
