'use strict';
import {View, inject, DetailAPI, TasklistAPI} from '../../index';
import {ITaskData, IStageData, ITasklistData} from 'teambition';

@inject([
  'DetailAPI',
  'TasklistAPI'
])
export class ChooseStageView extends View {
  public ViewName = 'ChooseStageView';

  public detail: ITaskData;
  public stages: IStageData[];

  private DetailAPI: DetailAPI;
  private TasklistAPI: TasklistAPI;
  private boundToObjectType: string;
  private boundToObjectId: string;

  constructor() {
    super();
    this.zone.run(() => {
      this.boundToObjectId = this.$state.params._id;
      this.boundToObjectType = this.$state.params.type;
    });
  }

  public onInit() {
    return this.DetailAPI.fetch(this.boundToObjectId, this.boundToObjectType)
    .then((detail: ITaskData) => {
      this.detail = detail;
      return this.TasklistAPI.fetch(detail._tasklistId)
      .then((tasklist: ITasklistData) => {
        this.stages = tasklist.hasStages;
      });
    });
  }

  public onAllChangesDone() {
    angular.forEach(this.stages, (stage: any) => {
      stage.isSelected = this.detail._stageId === stage._id;
    });
  }

  public chooseStage($index: string) {
    let stage = this.stages[$index];
    if (stage._id !== this.detail._stageId) {
      this.DetailAPI.update(this.boundToObjectId, this.boundToObjectType, {
        _stageId: stage._id
      }, 'move')
      .then(() => {
        this.hideLoading();
        this.showMsg('success', '移动任务成功', '');
        window.history.back();
      })
      .catch((reason: any) => {
        let message = this.getFailureReason(reason);
        this.hideLoading();
        this.showMsg('error', '移动任务失败', message);
        window.history.back();
      });
    }
  }
}

angular.module('teambition').controller('ChooseStageView', ChooseStageView);
