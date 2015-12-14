'use strict';
import BaseModel from '../bases/BaseModel';
import {IStageData} from 'teambition';

class StageModel extends BaseModel {
  // set stages by tasklist id
  public setStages(tasklistId, stages: IStageData[]) {
    let result: IStageData[] = [];
    angular.forEach(stages, (stage: IStageData, index: number) => {
      let cache = this.getDetail(stage._id);
      if (!cache) {
        result.push(stage);
        this.setDetail(stage);
      }else {
        result.push(cache);
      }
    });
    this._set('stages:tasklist', tasklistId, stages);
  }

  public getStages(tasklistid: string) {
    return this._get<IStageData[]>('stages:tasklist', tasklistid);
  }

  public getDetail(stageId: string) {
    return this._get<IStageData>('stage:detail', stageId);
  }

  public setDetail(stage: IStageData) {
    this._set('stage:detail', stage._id, stage);
  }
}

export default new StageModel();
