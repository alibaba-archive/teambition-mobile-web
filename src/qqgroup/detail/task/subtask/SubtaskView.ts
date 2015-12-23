'use strict';
import {
  nobodyUrl,
  inject,
  View,
  SubtasksAPI
} from '../../../index';
import {ISubtaskData} from 'teambition';

@inject([
  'SubtasksAPI'
])
export class SubtaskView extends View {

  public ViewName = 'SubtaskView';
  public subtasks: ISubtaskData[];

  public nobodyUrl = nobodyUrl;

  private SubtasksAPI: SubtasksAPI;
  private taskid: string;

  constructor() {
    super();
    this.zone.run(() => {
      this.taskid = this.$state.params._id;
    });
  }

  public onInit() {
    return this.SubtasksAPI.fetch(this.taskid)
    .then((data: ISubtaskData[]) => {
      this.subtasks = data;
    });
  }

  public doSubTask(subtask: ISubtaskData) {
    return this.SubtasksAPI.update(subtask._id, {
      isDone: !subtask.isDone
    }, 'isDone')
    .catch((reason: any) => {
      let message = this.getFailureReason(reason);
      this.showMsg('error', '更新状态出错', message);
    });
  }
}

angular.module('teambition').controller('SubtaskView', SubtaskView);

export * from './create/CreateSubtaskView';
