'use strict';
import {View, inject, DetailAPI, TasklistAPI} from '../../index';
import {ITasklistData} from 'teambition';

@inject([
  'DetailAPI',
  'TasklistAPI'
])
export class ChooseTasklistView extends View {
  public detail: any;
  public tasklists: ITasklistData[];

  private DetailAPI: DetailAPI;
  private TasklistAPI: TasklistAPI;
  private boundToObjectType: string;
  private boundToObjectId: string;

  public onInit() {
    this.boundToObjectId = this.$state.params._id;
    this.boundToObjectType = this.$state.params.type;
    return this.DetailAPI.fetch(this.boundToObjectId, this.boundToObjectType)
    .then((detail: any) => {
      this.detail = detail;
      let projectId = detail._projectId;
      return this.TasklistAPI.fetchAll(projectId)
      .then((tasklists: ITasklistData[]) => {
        this.tasklists = tasklists;
      });
    });
  }

  public onAllChangesDone() {
    angular.forEach(this.tasklists, (tasklist: any) => {
      tasklist.isSelected = (this.detail._tasklistId === tasklist._id);
    });
  }

  public chooseTasklist($index: string) {
    let tasklist = this.tasklists[$index];
    let id = tasklist._id;
    if (id !== this.detail._tasklistId) {
      this.showLoading();
      let stageId = tasklist.hasStages[0]._id;
      this.DetailAPI.update(this.boundToObjectId, this.boundToObjectType, {
        _stageId: stageId
      }, 'move')
      .then(() => {
        this.hideLoading();
        this.showMsg('success', '移动任务成功', '');
        window.history.back();
      })
      .catch((reason: any) => {
        let message = this.getFailureReason(reason);
        this.hideLoading();
        this.showMsg('error', '移动任务失败', message);
        window.history.back();
      });
    }
  }
}

angular.module('teambition').controller('ChooseTasklistView', ChooseTasklistView);
