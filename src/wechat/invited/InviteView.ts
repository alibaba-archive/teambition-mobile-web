'use strict';
import {View, ProjectsAPI} from '../index';
import {IProjectData} from 'teambition';

class InvitedView extends View {

  private ProjectsAPI: ProjectsAPI;

  constructor() {
    super();
    this.zone.run(angular.noop);
  }

  public onInit() {
    const _projectId = this.$state.params.projectId;
    const _signCode = this.$state.params.signCode;
    const _invitorId = this.$state.params.inviterId;
    return this.ProjectsAPI.joinByCode(_projectId, _signCode, _invitorId)
    .then((data: IProjectData) => {
      if (data.name) {
        this.showMsg('success', '已经加入', data.name);
      }else {
        this.showMsg('success', '已经加入', '');
      }
    })
    .catch((reason: any) => {
      const message = this.getFailureReason(reason);
      this.showMsg('error', '加入项目失败', message);
    });
  }
}

angular.module('teambition').service('InvitedView', InvitedView);
