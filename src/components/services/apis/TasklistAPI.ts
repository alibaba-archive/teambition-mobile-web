/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';
  export interface ITasklistData {
    _id: string;
    title: string;
    description: string;
    _projectId: string;
    _creatorId: string;
    isArchived: boolean;
    stageIds: string[];
    updated: string;
    created: string;
    totalCount: number;
    doneCount: number;
    undoneCount: number;
    expiredCount: number;
    recentCount: number;
    hasStages: IStageData[];
  };

  export interface ITasklistAPI {
    fetch(tasklistId: string): angular.IPromise<ITasklistData>;
    fetchAll(_projectId: string): angular.IPromise<ITasklistData[]>;
    fetchTasksByTasklistId(tasklistId: string): angular.IPromise<ITaskDataParsed[]>;
  }

  @inject([
    'TasklistModel',
    'TaskModel'
  ])
  class TasklistAPI extends BaseAPI implements ITasklistAPI {
    private TasklistModel: ITasklistModel;
    private TaskModel: ITaskModel;

    public fetch (_id: string) {
      let cache = this.TasklistModel.getOne(_id);
      let deferred = this.$q.defer<ITasklistData>();
      if (cache) {
        deferred.resolve(cache);
        return deferred.promise;
      }else {
        return this.RestAPI.get({
          Type: 'tasklists',
          Id: _id
        }, (data: ITasklistData) => {
          this.TasklistModel.setOne(_id, data);
          return data;
        })
        .$promise;
      }
    }

    public fetchAll (_projectId: string) {
      let tasklists = this.TasklistModel.getTasklistsCollection(_projectId);
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
          this.TasklistModel.setOne(tasklist._id, tasklist);
        });
        this.TasklistModel.setTasklistsCollection(_projectId, tasklists);
      })
      .$promise;
    }

    public fetchTasksByTasklistId (_tasklistId: string) {
      let cache: ITaskDataParsed[] = this.TaskModel.getTasklistCollection(_tasklistId);
      let deferred = this.$q.defer<ITaskDataParsed[]>();
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
          fields: this.queryFileds.taskFileds
        }, (data: ITaskData[]) => {
          this.TaskModel.setTasklistCollection(_tasklistId, data);
        })
        .$promise,
        this.RestAPI.query({
          Type: 'tasklists',
          Id: _tasklistId,
          Path1: 'tasks',
          isDone: false,
          fields: this.queryFileds.taskFileds
        }, (data: ITaskData[]) => {
          this.TaskModel.setTasklistCollection(_tasklistId, data);
        })
        .$promise
      ])
      .then(() => {
        let tasks = this.TaskModel.getTasklistCollection(_tasklistId);
        return tasks;
      });
    }

    public fetchTasksBySmartGroup(type: string) {
      console.log(123);
    }
  }

  angular.module('teambition').service('TasklistAPI', TasklistAPI);
}
