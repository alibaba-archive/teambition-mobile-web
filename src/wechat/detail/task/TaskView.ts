'use strict';
import {parentView, View} from '../../index';
import {ITaskData, IProjectData} from 'teambition';

@parentView('DetailView')
export class TaskView extends View {

  public task: ITaskData;
  public project: IProjectData;

  public onInit() {
    return this.parent.onInit();
  }

  public onAllChangesDone() {
    this.task = this.parent.detail;
    this.project = this.parent.project;
  }

  public openSubtasks () {
    if (this.task.subtaskCount) {
      window.location.hash = `/detail/task/${this.task._id}/subtasks`;
    }
  }

}

angular.module('teambition').controller('TaskView', TaskView);

export * from './subtask/SubtaskView';
