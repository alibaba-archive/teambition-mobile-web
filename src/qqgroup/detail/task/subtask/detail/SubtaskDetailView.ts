import {inject, View, SubtasksAPI, MemberAPI, nobodyUrl} from '../../../../';
import {ISubtaskData, IMemberData, ITaskData} from 'teambition';

@inject([
  'SubtasksAPI',
  'MemberAPI'
])
export class SubtaskDetailView extends View {

  public static $inject = ['$scope'];

  public ViewName = 'SubtaskDetailView';
  public subtask: ISubtaskData;
  public members: {
    [index: string]: IMemberData;
  };
  public dueDate: string;
  public content: string;

  private subtaskId: string;
  private MemberAPI: MemberAPI;
  private SubtasksAPI: SubtasksAPI;
  constructor(
    $scope: angular.IScope
  ) {
    super();
    this.$scope = $scope;
    this.zone.run(() => {
      this.subtaskId = this.$state.params.subtaskId;
    });
  }

  public onInit() {
    return this.SubtasksAPI.fetchOne(this.subtaskId)
    .then((subtask: ISubtaskData) => {
      this.subtask = subtask;
      this.dueDate = subtask.dueDate;
      this.content = subtask.content;
      return this.MemberAPI.fetch(subtask._projectId);
    }).then((data: any) => {
      this.members = data;
    });
  }

  public getExecutorName() {
    if (this.members) {
      const executorId = this.subtask._executorId;
      if (executorId) {
        return this.members[executorId].name;
      }else {
        return '设置一个执行者';
      }
    }
  }

  public getAvatar() {
    if (!this.members) {
      return;
    }
    if (this.subtask._executorId) {
      const executor = this.members[this.subtask._executorId];
      if (executor) {
        return executor.avatarUrl;
      }else {
        return nobodyUrl;
      }
    }else {
      return nobodyUrl;
    }
  }

  public openExecutor() {
    this.openModal('detail/task/subtask/detail/executor.html', {
      scope: this.$scope,
      animation: 'slide-in-up'
    });
  }

  public chooseExecutor(id: string) {
    this.SubtasksAPI.update(this.subtaskId, {
      _executorId: id
    }, '_executorId')
    .then(() => {
      this.cancelModal();
    })
    .catch((reason: any) => {
      const message = this.getFailureReason(reason);
      this.showMsg('error', '更新执行者失败', message);
      this.cancelModal();
    });
  }

  public updateSubtask() {
    this.SubtasksAPI.update(this.subtaskId, {
      content: this.content,
      dueDate: this.dueDate ? new Date(this.dueDate).toISOString() : null
    })
    .then(() => {
      this.showMsg('success', '更新子任务成功', '');
      window.history.back();
    })
    .catch((reason: any) => {
      const message = this.getFailureReason(reason);
      this.showMsg('error', '更新失败', message);
    });
  }

  public transformSubtask() {
    this.SubtasksAPI.transform(this.subtaskId)
    .then((data: ITaskData) => {
      window.history.back();
    })
    .catch((reason: any) => {
      const message = this.getFailureReason(reason);
      this.showMsg('error', '转换失败', message);
    });
  }

  public deleteSubtask() {
    this.SubtasksAPI.deleteOne(this.subtaskId)
    .then(() => {
      window.history.back();
    })
    .catch((reason: any) => {
      const message = this.getFailureReason(reason);
      this.showMsg('error', '转换失败', message);
    });
  }

}

angular.module('teambition').controller('SubtaskDetailView', SubtaskDetailView);
