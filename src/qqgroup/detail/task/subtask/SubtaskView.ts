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

  public subtasks: ISubtaskData[];

  public nobodyUrl = nobodyUrl;

  private SubtasksAPI: SubtasksAPI;
  private taskid: string;

  public onInit() {
    this.taskid = this.$state.params._id;
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

  public openCreate() {
    window.location.hash = `/detail/task/${this.taskid}/subtasks/create`;
  }

  public openDetail(_id: string) {
    window.location.hash = `/detail/task/${this.taskid}/subtasks/${_id}/detail`;
  }
}

angular.module('teambition').controller('SubtaskView', SubtaskView);

export * from './create/CreateSubtaskView';
export * from './detail/SubtaskDetailView';
