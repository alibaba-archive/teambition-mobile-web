'use strict';
import {
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
  public static $inject = ['$scope'];

  public ViewName = 'CreateSubtaskView';

  public content: string;
  public executorId = '0';
  public dueDate: string;

  private DetailAPI: DetailAPI;
  private MemberAPI: MemberAPI;
  private SubtasksAPI: SubtasksAPI;
  private taskid: string;
  private task: ITaskData;
  private members: {
    [index: string]: IMemberData;
  };

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
    .then((task: ITaskData) => {
      this.task = task;
      return this.MemberAPI.fetch(task._projectId)
      .then((members: {[index: string]: IMemberData}) => {
        this.members = members;
      });
    });
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
    if (typeof this.executorId === 'undefined') {
      this.members[0].isSelected = true;
    }
    this.openModal('detail/task/subtask/create/executor.html', {
      scope: this.$scope
    });
  }

  public selectExecutor(id: string) {
    if (id !== this.executorId) {
      this.members[id].isSelected = true;
      if (typeof this.executorId !== 'undefined') {
        this.members[this.executorId].isSelected = false;
      }
      this.executorId = id;
    }
    this.cancelModal();
  }

  public createSubtask() {
    if (this.content && this.taskid) {
      this.showLoading();
      let executorId = this.executorId === '0' ? null : this.executorId;
      this.SubtasksAPI.create(
        this.content,
        this.taskid,
        executorId,
        new Date(this.dueDate).toISOString()
      )
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
