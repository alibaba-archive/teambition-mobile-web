'use strict';
import {inject, View, DetailAPI, MemberAPI} from '../../../index';
import {ITaskData, IMemberData} from 'teambition';

@inject([
  'DetailAPI',
  'MemberAPI'
])
export class EditExectorView extends View {
  public members: any;
  public detail: ITaskData;

  private DetailAPI: DetailAPI;
  private MemberAPI: MemberAPI;
  private boundToObjectId: string;
  private lastSelected: string;

  public onInit() {
    this.boundToObjectId = this.$state.params._id;
    return this.DetailAPI.fetch(this.boundToObjectId, 'task')
    .then((detail: ITaskData) => {
      this.detail = detail;
      return detail._projectId;
    })
    .then((projectId: string) => {
      return this.MemberAPI.fetch(projectId)
      .then((members: {[index: string]: IMemberData}) => {
        this.members = members;
        let executorId = this.detail._executorId ? this.detail._executorId : '0';
        angular.forEach(this.members, (member: IMemberData) => {
          if (member._id === executorId) {
            member.isSelected = true;
          }else {
            member.isSelected = false;
          }
        });
      });
    });
  }

  public selectExecutor(id: string) {
    if (id === this.detail._executorId) {
      return ;
    }
    this.showLoading();
    let _id = id === '0' ? null : id;
    return this.DetailAPI.update(this.boundToObjectId, 'task', {
      _executorId: _id
    })
    .then((patch: any) => {
      if (this.lastSelected) {
        this.members[this.lastSelected].isSelected = false;
      }
      this.members[id].isSelected = true;
      this.lastSelected = id;
      this.hideLoading();
      setTimeout(() => {
        this.showMsg('success', '更新成功', '已成功更新任务执行者');
      }, 500);
      window.history.back();
    })
    .catch((reason: any) => {
      const message = this.getFailureReason(reason);
      this.hideLoading();
      setTimeout(() => {
        this.showMsg('error', '网络错误', message);
      }, 500);
      window.history.back();
    });
  }
}

angular.module('teambition').controller('EditExectorView', EditExectorView);
