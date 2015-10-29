/// <reference path="../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface ITasklistModel {
    getOne(tasklistId: string): ITasklistData;
    setOne(tasklistId: string, data: ITasklistData): void;
    getTasklistsCollection(projectId: string): ITasklistData[];
    setTasklistsCollection(projectId: string, collection: ITasklistData[]): void;
  }

  class TasklistModel extends BaseModel implements ITasklistModel {

    public getOne(tasklistId: string) {
      return this._get<ITasklistData>('tasklist', tasklistId);
    }

    public setOne(tasklistId: string, data: ITasklistData) {
      this._set('tasklist', tasklistId, data);
    }

    public getTasklistsCollection(projectId: string) {
      return this._get<ITasklistData[]>('tasklists', projectId);
    }

    public setTasklistsCollection(projectId: string, collection: ITasklistData[]) {
      let cache = this.getTasklistsCollection(projectId);
      if (!cache) {
        this._set('tasklists', projectId, collection);
      }
      angular.forEach(collection, (tasklist: ITasklistData, index: number) => {
        this.setOne(tasklist._id, tasklist);
      });
    }
  }

  angular.module('teambition').service('TasklistModel', TasklistModel);
}
