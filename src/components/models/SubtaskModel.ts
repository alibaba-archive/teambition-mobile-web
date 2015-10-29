/// <reference path="../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface ISubtaskModel {
    getFromTask(taskId: string): ISubtaskData[];
    setFromTask(taskId: string, content: ISubtaskData[]): void;
    setSubtask(subtask: ISubtaskData): void;
    updateSubtask(taskId: string, patch: any): void;
  }

  class SubtaskModel extends BaseModel implements ISubtaskModel {
    public getFromTask(taskId: string) {
      return this._get<ISubtaskData[]>('task:subtask', taskId);
    }

    public setFromTask(taskId: string, content: ISubtaskData[]) {
      let cache = this.getFromTask(taskId);
      if (!cache) {
        this._set('task:subtask', taskId, content);
      }
    }

    public setSubtask(subtask: ISubtaskData) {
      this._set('subtask:detail', subtask._id, subtask);
    }

    public updateSubtask(subtaskId: string, patch: any) {
      this._updateObj('task:subtask', subtaskId, patch);
    }
  }

  angular.module('teambition').service('SubtaskModel', SubtaskModel);
}
