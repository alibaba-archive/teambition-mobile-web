'use strict';
import BaseAPI from '../../bases/BaseAPI';
import TaskModel from '../../models/TaskModel';
import TasklistModel from '../../models/TasklistModel';
import {ITasklistData, ITaskData} from 'teambition';

export class TasklistAPI extends BaseAPI {

  public fetch (_id: string) {
    let cache = TasklistModel.getOne(_id);
    let deferred = this.$q.defer<ITasklistData>();
    if (cache) {
      deferred.resolve(cache);
      return deferred.promise;
    }else {
      return this.RestAPI.get({
        Type: 'tasklists',
        Id: _id
      }, (data: ITasklistData) => {
        TasklistModel.setOne(_id, data);
        return data;
      })
      .$promise;
    }
  }

  public fetchAll (_projectId: string) {
    let tasklists = TasklistModel.getTasklistsCollection(_projectId);
    let deferred = this.$q.defer<ITasklistData[]>();
    if (tasklists) {
      deferred.resolve(tasklists);
      return deferred.promise;
    }
    return this.RestAPI.query({
      Type: 'tasklists',
      _projectId: _projectId
    }, (tasklists: ITasklistData[]) => {
      angular.forEach(tasklists, (tasklist: ITasklistData, index: number) => {
        TasklistModel.setOne(tasklist._id, tasklist);
      });
      TasklistModel.setTasklistsCollection(_projectId, tasklists);
    })
    .$promise;
  }

  public fetchTasksByTasklistId (_tasklistId: string) {
    let cache: ITaskData[] = TaskModel.getTasklistCollection(_tasklistId);
    let deferred = this.$q.defer<ITaskData[]>();
    if (cache) {
      deferred.resolve(cache);
      return deferred.promise;
    }
    return this.$q.all([
      this.RestAPI.query({
        Type: 'tasklists',
        Id: _tasklistId,
        Path1: 'tasks',
        isDone: true,
        fields: this.fields.taskFileds
      }, (data: ITaskData[]) => {
        TaskModel.setTasklistCollection(_tasklistId, data);
      })
      .$promise,
      this.RestAPI.query({
        Type: 'tasklists',
        Id: _tasklistId,
        Path1: 'tasks',
        isDone: false,
        fields: this.fields.taskFileds
      }, (data: ITaskData[]) => {
        TaskModel.setTasklistCollection(_tasklistId, data);
      })
      .$promise
    ])
    .then(() => {
      let tasks = TaskModel.getTasklistCollection(_tasklistId);
      return tasks;
    });
  }

  public fetchTasksBySmartGroup(type: string) {
    console.log(123);
  }
}

angular.module('teambition').service('TasklistAPI', TasklistAPI);
