'use strict';
import {inject, parentView, View, SubtasksAPI} from '../../../index';
import {ISubtaskData} from 'teambition';

@parentView('TaskView')
@inject([
  'SubtasksAPI'
])
export class SubtaskView extends View {

  public subtasks: ISubtaskData[];

  private SubtasksAPI: SubtasksAPI;

  public onInit() {
    let taskId: string;
    if (this.parent) {
      taskId = this.parent.task._id;
    }else {
      taskId = this.$state.params._id;
    }
    return this.SubtasksAPI.fetch(taskId)
    .then((data: ISubtaskData[]) => {
      this.subtasks = data;
    });
  }
}

angular.module('teambition').controller('SubtaskView', SubtaskView);
