'use strict';
import {
  nobodyUrl,
  parentView,
  inject,
  View,
  DetailAPI
} from '../../index';
import {ITaskData, IMemberData, IProjectData} from 'teambition';

@parentView('DetailView')
@inject([
  'DetailAPI'
])
export class TaskView extends View {

  public ViewName = 'TaskView';

  public task: ITaskData;
  public project: IProjectData;
  public members: {
    [index: string]: IMemberData
  };

  public content: string;

  private DetailAPI: DetailAPI;

  constructor() {
    super();
    this.zone.run(angular.noop);
  }

  public onInit() {
    return this.parent.onInit();
  }

  public onAllChangesDone() {
    this.members = this.parent.projectMembers;
    this.task = this.parent.detail;
    this.content = this.task.content;
    this.project = this.parent.project;
    this.$rootScope.global.title = '任务详情';
  }

  public getExecutorAvatar() {
    if (!this.task) {
      return;
    }
    let executor = this.members[this.task._executorId] || this.task.executor;
    let avatarUrl: string;
    avatarUrl = executor ? executor.avatarUrl : nobodyUrl;
    return avatarUrl;
  }

  public getExecutorName() {
    if (!this.task) {
      return;
    }
    let executor = this.members[this.task._executorId] || this.task.executor;
    let name: string;
    name = executor ? executor.name : '没有执行者';
    return name;
  }

  public doTask() {
    let isDone = !this.task.isDone;
    this.DetailAPI.update(this.task._id, 'task', {
      isDone: isDone
    }, 'isDone')
    .catch((reason: any) => {
      let message = this.getFailureReason(reason);
      this.showMsg('error', '更改任务状态失败', message);
    });
  }

  public updateTaskContent() {
    if (this.task.content !== this.content) {
      this.DetailAPI.update(this.task._id, 'task', {
        content: this.content
      }, 'content')
      .catch((reason: any) => {
        let message = this.getFailureReason(reason);
        this.showMsg('error', '更新失败', message);
        this.content = this.task.content;
      });
    }
  }

}

angular.module('teambition').controller('TaskView', TaskView);

export * from './dueDate/EditDuedateView';
export * from './executor/EditExectorView';
export * from './note/EditNoteView';
export * from './priority/EditPriorityView';
export * from './recurrence/EditRecurrenceView';
export * from './subtask/SubtaskView';
