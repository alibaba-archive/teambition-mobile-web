/// <reference path="../../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  let actionSheet: any;

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
      if (Ding) {
        Ding.setLeft('返回', true, true, () => {
          window.history.back();
        });
        Ding.setRight('更多', true, false, () => {
          this.showOptions();
        });
      }
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

    private showOptions() {
      if (actionSheet) {
        actionSheet = actionSheet();
      }else {
        actionSheet = this.$ionicActionSheet.show({
          buttons: [{
            text: '<font color="red">删除任务</font>'
          }],
          cancelText: '取消',
          buttonClicked: (index: number) => {
            return true;
          }
        });
      }
    }

  }

  angular.module('teambition').controller('TaskView', TaskView);
}
