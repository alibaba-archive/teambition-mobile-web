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
        let taskSubtasksIndex = [];
        angular.forEach(content, (subtask: ISubtaskData) => {
          this._set(`subtask:detail`, subtask._id, subtask);
          taskSubtasksIndex.push(subtask._id);
        });
        this._set('task:subtask:index', taskId, taskSubtasksIndex);
        this._set('task:subtask', taskId, content);
      }
    }

    public setSubtask(subtask: ISubtaskData) {
      let index = this._get<string[]>('task:subtask:index', subtask._taskId);
      if (index.indexOf(subtask._id) === -1) {
        let subtasks = this.getFromTask(subtask._taskId);
        subtasks.push(subtask);
        index.push(subtask._id);
      }
      this._set('subtask:detail', subtask._id, subtask);
    }

    public updateSubtask(subtaskId: string, patch: any) {
      this._updateObj('subtask:detail', subtaskId, patch);
    }
  }

  angular.module('teambition').service('SubtaskModel', SubtaskModel);
}
