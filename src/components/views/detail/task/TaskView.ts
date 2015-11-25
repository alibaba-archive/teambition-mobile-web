/// <reference path="../../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  @parentView('DetailView')
  @inject([
    'DetailAPI'
  ])
  class TaskView extends View {

    public ViewName = 'TaskView';

    public task: ITaskDataParsed;
    public project: IProjectDataParsed;
    public members: {
      [index: string]: IMemberData
    };

    public content: string;

    private DetailAPI: IDetailAPI;

    constructor() {
      super();
      this.zone.run(noop);
    }

    public onInit() {
      return this.parent.onInit();
    }

    public onAllChangesDone() {
      this.members = this.parent.projectMembers;
      this.task = this.parent.detail;
      this.content = this.task.content;
      this.project = this.parent.project;
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
          this.showMsg('error', '网络错误', message);
          this.content = this.task.content;
        });
      }
    }

  }

  angular.module('teambition').controller('TaskView', TaskView);
}
