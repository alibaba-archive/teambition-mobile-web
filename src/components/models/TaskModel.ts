/// <reference path="../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface ITaskModel extends IDetailModel {
    setNoneExecutorCollection(projectId: string, content: ITaskDataParsed[]): void;
    getNoneExecutorCollection(projectId: string): ITaskDataParsed[];
    setDueCollection(projectId: string, content: ITaskDataParsed[]): void;
    getDueExecutorCollection(projectId: string): ITaskDataParsed[];
    setTasklistCollection(tasklistId: string, collection: ITaskDataParsed[]): void;
    getTasklistCollection(tasklistId: string): ITaskDataParsed[];

  }

  class TaskModel extends DetailModel implements ITaskModel {

    private noneExecutorCollectionIndex: string[] = [];
    private dueCollectionIndex: string[] = [];

    public setNoneExecutorCollection(projectId: string, content: ITaskDataParsed[]) {
      let cache = this._get<ITaskDataParsed[]>('noneExecutor:tasks', projectId);
      if (!cache) {
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
      if (!cache) {
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

    public setTasklistCollection(tasklistId: string, collection: ITaskDataParsed[]) {
      let cache = this.getTasklistCollection(tasklistId);
      if (!cache) {
        this._set('tasks:in', tasklistId, collection);
      }
    }

    public getTasklistCollection(tasklistId: string) {
      return this._get<ITaskDataParsed[]>('tasks:in', tasklistId);
    }
  }

  angular.module('teambition').service('TaskModel', TaskModel);
}
