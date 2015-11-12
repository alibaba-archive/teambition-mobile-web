/// <reference path="../../../interface/teambition.d.ts" />
module teambition {
  'use strict';
  @parentView('DetailView')
  class TaskView extends View {

    public ViewName = 'TaskView';

    public task: ITaskDataParsed;
    public project: IProjectDataParsed;
    public members: {
      [index: string]: IMemberData
    };
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
      this.project = this.parent.project;
    }

    public openEdit(name: string) {
      window.location.hash = `/detail/task/${this.task._id}/${name}`;
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

  }

  angular.module('teambition').controller('TaskView', TaskView);
}
