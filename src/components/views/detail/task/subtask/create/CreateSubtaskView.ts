/// <reference path="../../../../../interface/teambition.d.ts" />
module teambition {
  'use strict';
  @inject([
    'DetailAPI',
    'MemberAPI',
    'SubtasksAPI'
  ])
  class CreateSubtaskView extends View {
    public ViewName = 'CreateSubtaskView';

    public content: string;
    public executorId = '0';
    public dueDate: Date;

    private DetailAPI: IDetailAPI;
    private MemberAPI: IMemberAPI;
    private SubtasksAPI: ISubtasksAPI;
    private taskid: string;
    private task: ITaskDataParsed;
    private members: {
      [index: string]: IMemberData;
    };

    // @ngInject
    constructor(
      $scope: angular.IScope
    ) {
      super();
      this.$scope = $scope;
      this.zone.run(() => {
        this.taskid = this.$state.params._id;
      });
    }

    public onInit() {
      return this.DetailAPI.fetch(this.taskid, 'task')
      .then((task: ITaskDataParsed) => {
        this.task = task;
        return this.MemberAPI.fetch(task._projectId)
        .then((members: {[index: string]: IMemberData}) => {
          this.members = members;
        });
      });
    }

    public onAllChangesDone() {
      if (Ding) {
        Ding.setRight('确认', true, false, () => {
          this.createSubtask();
        });
      }
    }

    public getExecutorName() {
      if (this.members) {
        if (this.executorId) {
          return this.members[this.executorId].name;
        }else {
          return '设置一个执行者';
        }
      }
    }

    public openExecutor() {
      angular.forEach(this.members, (member: IMemberData) => {
        if (member._id === '0') {
          member.isSelected = true;
        }else {
          member.isSelected = false;
        }
      });
      this.openModal('detail/task/subtask/create/executor.html', {
        scope: this.$scope
      });
      if (Ding) {
        Ding.setRight('', false, false);
      }
    }

    public selectExecutor(id: string) {
      if (id !== this.executorId) {
        this.members[id].isSelected = true;
        if (this.executorId) {
          this.members[this.executorId].isSelected = false;
        }
        this.executorId = id;
      }
      if (Ding) {
        Ding.setRight('确认', true, false, () => {
          this.createSubtask();
        });
      }
      this.cancelModal();
    }

    private createSubtask() {
      if (this.content && this.taskid) {
        this.showLoading();
        let executorId = this.executorId === '0' ? null : this.executorId;
        this.SubtasksAPI.create(this.content, this.taskid, executorId)
        .then(() => {
          this.hideLoading();
          window.history.back();
        })
        .catch((reason: any) => {
          let message = this.getFailureReason(reason);
          this.showMsg('error', '创建失败', message);
          this.hideLoading();
          window.history.back();
        });
      }
    }
  }
  angular.module('teambition').controller('CreateSubtaskView', CreateSubtaskView);
}
