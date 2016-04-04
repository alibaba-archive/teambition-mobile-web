'use strict';
import {
  Ding,
  inject,
  View,
  DetailAPI,
  SubtasksAPI,
  MemberAPI
} from '../../../../index';
import {ITaskData, IMemberData} from 'teambition';

@inject([
  'DetailAPI',
  'MemberAPI',
  'SubtasksAPI'
])
export class CreateSubtaskView extends View {

  public content: string;
  public executorId = '0';
  public dueDate: Date;

  private DetailAPI: DetailAPI;
  private MemberAPI: MemberAPI;
  private SubtasksAPI: SubtasksAPI;
  private taskid: string;
  private task: ITaskData;
  private members: {
    [index: string]: IMemberData;
  };

  public onInit() {
    this.taskid = this.$state.params._id;
    return this.DetailAPI.fetch(this.taskid, 'task')
    .then((task: ITaskData) => {
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
