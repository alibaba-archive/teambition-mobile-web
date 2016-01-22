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
    const executor = this.members[this.task._executorId] || this.task.executor;
    let avatarUrl: string;
    avatarUrl = executor ? executor.avatarUrl : nobodyUrl;
    return avatarUrl;
  }

  public getExecutorName() {
    if (!this.task) {
      return;
    }
    const executor = this.members[this.task._executorId] || this.task.executor;
    let name: string;
    name = executor ? executor.name : '没有执行者';
    return name;
  }

  public doTask() {
    const isDone = !this.task.isDone;
    this.DetailAPI.update(this.task._id, 'task', {
      isDone: isDone
    }, 'isDone')
    .then(() => {
      const options = this.shareToQQgroup();
      window['openGroup'].share(options);
    })
    .catch((reason: any) => {
      const message = this.getFailureReason(reason);
      this.showMsg('error', '更改任务状态失败', message);
    });
  }

  public updateTaskContent() {
    if (this.task.content !== this.content) {
      this.DetailAPI.update(this.task._id, 'task', {
        content: this.content
      }, 'content')
      .catch((reason: any) => {
        const message = this.getFailureReason(reason);
        this.showMsg('error', '更新失败', message);
        this.content = this.task.content;
      });
    }
  }

  private shareToQQgroup() {
    const executorName = this.members[this.task._executorId].name || this.task.executorName || '暂无执行者';
    const dueDate = this.task.dueDate ? `,截止日期: ${moment(this.task.dueDate).calendar()}` : '';
    return {
      title: `我完成了任务: ${this.task.content}`,
      desc: `执行者: ${executorName} ${dueDate}`,
      share_url: `http://${window.location.host}/qqgroup?_boundToObjectType=task&_boundToObjectId=${this.task._id}`,
      image_url: `http://${window.location.host}/images/teambition.png`
    };
  }

}

angular.module('teambition').controller('TaskView', TaskView);

export * from './dueDate/EditDuedateView';
export * from './executor/EditExectorView';
export * from './note/EditNoteView';
export * from './priority/EditPriorityView';
export * from './recurrence/EditRecurrenceView';
export * from './subtask/SubtaskView';