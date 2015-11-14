/// <reference path="../../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  let organization: IOrganizationData;
  let visiable: string;

  @inject([
    'OrganizationAPI',
    'ProjectsAPI'
  ])
  class CreateProjectView extends View {

    public ViewName = 'CreateProjectView';

    public organizations: IOrganizationData[];

    public projectName: string;

    private OrganizationAPI: IOrganizationAPI;
    private ProjectsAPI: IProjectsAPI;

    // @ngInject
    constructor(
      $scope: angular.IScope
    ) {
      super();
      this.$scope = $scope;
      this.zone.run(() => {
        if (Ding) {
          Ding.setLeft('取消', true, false, () => {
            window.history.back();
          });
          Ding.setRight('确定', true, true, () => {
            this.createProject();
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

    public getOrganization() {
      let name: string;
      if (organization) {
        name = organization.name;
      }
      return name || '个人项目';
    }

    public getVisiable() {
      return visiable || '私有项目';
    }

    public openOrganization() {
      this.openModal('create/project/organization.html', {scope: this.$scope});
    }

    public openVisiable() {
      this.openModal('create/project/visiable.html', {scope: this.$scope});
    }

    public changeOrganization($index: number) {
      if (typeof $index !== 'undefined') {
        organization = this.organizations[$index];
      }else {
        organization = null;
      }
    }

    private createProject() {
      if (this.projectName) {
        this.ProjectsAPI.createProject(this.projectName);
      }
    }

  }

  angular.module('teambition').controller('CreateProjectView', CreateProjectView);
}
