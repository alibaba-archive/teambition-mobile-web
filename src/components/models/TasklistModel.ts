'use strict';
import BaseModel from '../bases/BaseModel';
import {ITasklistData} from 'teambition';

class TasklistModel extends BaseModel {

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

export default new TasklistModel();
