import {inject, View, SubtasksAPI, MemberAPI, nobodyUrl} from '../../../../';
import {ISubtaskData, IMemberData, ITaskData} from 'teambition';

@inject([
  'SubtasksAPI',
  'MemberAPI'
])
export class SubtaskDetailView extends View {
  public ViewName = 'SubtaskDetailView';
  public subtask: ISubtaskData;
  public members: {
    [index: string]: IMemberData;
  };
  public dueDate: string;

  private subtaskId: string;
  private MemberAPI: MemberAPI;
  private SubtasksAPI: SubtasksAPI;
  constructor() {
    super();
    this.zone.run(() => {
      this.subtaskId = this.$state.params.subtaskId;
    });
  }

  public onInit() {
    return this.SubtasksAPI.fetchOne(this.subtaskId)
    .then((subtask: ISubtaskData) => {
      this.subtask = subtask;
      this.dueDate = subtask.dueDate;
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

  public updateSubtask() {
    this.SubtasksAPI.update(this.subtaskId, {
      dueDate: new Date(this.dueDate).toISOString()
    }, 'dueDate')
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
