'use strict';
import {inject, View, DetailAPI} from '../../../index';
import {ITaskData} from 'teambition';

@inject([
  'DetailAPI'
])
export class EditPriorityView extends View {

  public task: ITaskData;
  public priority = [
    {
      priority: 0,
      name: '普通',
      isSelected: false
    },
    {
      priority: 1,
      name: '紧急',
      isSelected: false
    },
    {
      priority: 2,
      name: '非常紧急',
      isSelected: false
    }
  ];

  private taskid: string;
  private DetailAPI: DetailAPI;
  private lastSelected: number;

  public onInit() {
    this.taskid = this.$state.params._id;
    return this.DetailAPI.fetch(this.taskid, 'task')
    .then((task: ITaskData) => {
      this.task = task;
      this.lastSelected = task.priority;
      this.priority[task.priority].isSelected = true;
    });
  }

  public selectPriority(priority: number) {
    if (priority === this.task.priority) {
      return ;
    }
    this.showLoading();
    return this.DetailAPI.update(this.taskid, 'task', {
      priority: priority
    })
    .then(() => {
      this.priority[this.lastSelected].isSelected = false;
      this.priority[priority].isSelected = true;
      this.hideLoading();
      setTimeout(() => {
        this.showMsg('success', '更新成功', '已更新任务优先级');
      }, 500);
      window.history.back();
    })
    .catch((reason: any) => {
      const message = this.getFailureReason(reason);
      setTimeout(() => {
        this.showMsg('error', '更新失败', message);
      }, 500);
      this.hideLoading();
      window.history.back();
    });
  }
}

angular.module('teambition').controller('EditPriorityView', EditPriorityView);
