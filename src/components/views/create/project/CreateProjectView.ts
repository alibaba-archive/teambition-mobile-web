/// <reference path="../../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  let organization: IOrganizationData;
  let visiable: string;
  let lastIndex: number;

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
    private state: string;

    // @ngInject
    constructor(
      $scope: angular.IScope
    ) {
      super();
      this.$scope = $scope;
      this.zone.run(noop);
    }

    public onInit() {
      return this.OrganizationAPI.fetch()
      .then((organizations: IOrganizationData[]) => {
        this.organizations = organizations;
      });
    }

    public onAllChangesDone() {
      this.state = 'origin';
      this.setHeader();
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
      this.state = 'selectProjects';
      this.setHeader();
    }

    public openVisiable() {
      this.openModal('create/project/visiable.html', {scope: this.$scope});
    }

    public changeOrganization($index: number) {
      lastIndex = this.organizations.indexOf(organization);
      if (typeof $index !== 'undefined') {
        organization = this.organizations[$index];
      }else {
        organization = null;
      }
    }

    private setHeader() {
      if (Ding) {
        switch (this.state) {
          case 'origin':
            Ding.setLeft('取消', true, false, () => {
              window.history.back();
            });
            Ding.setRight('确定', true, true, () => {
              this.createProject();
            });
            break;
          case 'selectProjects':
            Ding.setLeft('取消', true, false, () => {
              organization = this.organizations[lastIndex];
              this.cancelModal();
              this.state = 'origin';
              this.setHeader();
            });
            Ding.setRight('确定', true, true, () => {
              this.cancelModal();
              this.state = 'origin';
              this.setHeader();
            });
            break;
        }
      }
    }

    private createProject() {
      if (this.projectName) {
        let orgsId = organization._id;
        this.showLoading();
        this.ProjectsAPI.createProject(this.projectName, orgsId)
        .then(() => {
          window.history.back();
          this.hideLoading();
        })
        .catch((reason: any) => {
          let message = this.getFailureReason(reason);
          this.showMsg('error', '创建失败', message);
          this.hideLoading();
        });
      }else {
        this.showMsg('error', '参数错误', '项目名称是必须的');
      }
    }

  }

  angular.module('teambition').controller('CreateProjectView', CreateProjectView);
}
