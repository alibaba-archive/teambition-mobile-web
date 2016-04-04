'use strict';
import {inject, View, ProjectsAPI} from '../index';
import {IProjectData} from 'teambition';

@inject([
  '$window',
  'ProjectsAPI'
])
export class InvitedView extends View {

  private ProjectsAPI: ProjectsAPI;
  private $window: angular.IWindowService;

  public onInit() {
    const _projectId = this.$state.params.projectId;
    const _signCode = this.$state.params.signCode;
    const _invitorId = this.$state.params.inviterId;
    if (_projectId && _signCode && _invitorId) {
      return this.ProjectsAPI.joinByCode(_projectId, _signCode, _invitorId)
      .then((data: IProjectData) => {
        if (data._id) {
          this.$window.location.hash = `/project/${data._id}/home`;
          const projectName = data.name ? data.name : '';
          setTimeout(() => {
            this.showMsg('success', '已经加入', projectName);
          }, 500);
        }else {
          this.showMsg('error', '加入项目失败', '服务端返回数据错误');
        }
      })
      .catch((reason: any) => {
        const message = this.getFailureReason(reason);
        this.showMsg('error', '加入项目失败', message);
      });
    }
  }
}

angular.module('teambition').controller('InvitedView', InvitedView);
