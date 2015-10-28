/// <reference path="../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface ITaskModel {
    setDetail(_id: string, content: ITaskData): void;
    updateDetail(_id: string, patch: any): void;
    setNoneExecutorCollection(projectId: string, content: ITaskDataParsed[]): void;
    getNoneExecutorCollection(projectId: string): ITaskDataParsed[];
    setDueCollection(projectId: string, content: ITaskDataParsed[]): void;
    getDueExecutorCollection(projectId: string): ITaskDataParsed[];
  }

  class TaskModel extends BaseModel implements ITaskModel {

    private noneExecutorCollectionIndex: string[] = [];
    private dueCollectionIndex: string[] = [];

    public setDetail(_id: string, content: ITaskData) {
      this._set('task:detail', _id, content);
    }

    public updateDetail(_id: string, patch: any) {
      this._updateObj('task:detail', _id, patch);
    }

    public setNoneExecutorCollection(projectId: string, content: ITaskDataParsed[]) {
      let cache = this._get<ITaskDataParsed[]>('noneExecutor:tasks', projectId);
      if (cache) {
        for (let index = content.length - 1; index > 0; index--) {
          let task = content[index];
          if (this.noneExecutorCollectionIndex.indexOf(task._id) === -1) {
            cache.push(task);
          }
        }
      }else {
        angular.forEach(content, (task: ITaskDataParsed, index: number) => {
          this.noneExecutorCollectionIndex.push(task._id);
        });
        this._set('noneExecutor:tasks', projectId, content);
      }
    }

    public getNoneExecutorCollection(projectId: string) {
      let cache = this._get<ITaskDataParsed[]>('noneExecutor:tasks', projectId);
      return cache;
    }

    public setDueCollection(projectId: string, content: ITaskDataParsed[]) {
      let cache = this._get<ITaskDataParsed[]>('due:tasks', projectId);
      if (cache) {
        for (let index = content.length - 1; index > 0; index--) {
          let task = content[index];
          if (this.dueCollectionIndex.indexOf(task._id) === -1) {
            cache.push(task);
          }
        }
      }else {
        angular.forEach(content, (task: ITaskDataParsed, index: number) => {
          this.dueCollectionIndex.push(task._id);
        });
        this._set('due:tasks', projectId, content);
      }
    }

    public getDueExecutorCollection(projectId: string) {
      let cache = this._get<ITaskDataParsed[]>('due:tasks', projectId);
      return cache;
    }
  }

  angular.module('teambition').service('TaskModel', TaskModel);
}
