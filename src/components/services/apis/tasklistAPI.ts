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
    'Cache',
    'taskParser'
  ])
  class TasklistAPI extends BaseAPI implements ITasklistAPI {
    private Cache: angular.ICacheObject;
    private taskParser: ITaskParser;

    public fetch (_id: string) {
      let cache = this.Cache.get<ITasklistData>(`tasklist:${_id}`);
      let deferred = this.$q.defer<ITasklistData>();
      if (cache) {
        deferred.resolve(cache);
        return deferred.promise;
      }else {
        return this.RestAPI.get({
          Type: 'tasklists',
          Id: _id
        }, (data: ITasklistData) => {
          this.Cache.put(`tasklist:${_id}`, data);
          return data;
        })
        .$promise;
      }
    }

    public fetchAll (_projectId: string) {
      let tasklists: ITasklistData[] = this.Cache.get<ITasklistData[]>(`tasklists:${_projectId}`);
      let deferred = this.$q.defer<ITasklistData[]>();
      if (tasklists) {
        deferred.resolve(tasklists);
        return deferred.promise;
      }
      return this.RestAPI.query({
        Type: 'tasklists',
        _projectId: _projectId
      }, (tasklists: ITaskData[]) => {
        angular.forEach(tasklists, (tasklist: ITasklistData, index: number) => {
          this.Cache.put(`tasklist:${tasklist._id}`, tasklist);
        });
        this.Cache.put(`tasklists:${_projectId}`, tasklists);
      })
      .$promise;
    }

    public fetchTasksByTasklistId (_tasklistId: string) {
      let cache: ITaskDataParsed[] = this.Cache.get<ITaskDataParsed[]>(`tasks:in:${_tasklistId}`);
      let deferred = this.$q.defer<ITaskDataParsed[]>();
      if (cache) {
        deferred.resolve(cache);
        return deferred.promise;
      }
      let tasks = [];
      return this.$q.all([
        this.RestAPI.query({
          Type: 'tasklists',
          Id: _tasklistId,
          Path1: 'tasks',
          isDone: true,
          fields: this.queryFileds.taskFileds
        }, (data: ITaskData[]) => {
          let result: ITaskDataParsed[] = this.prepareTasks(data, _tasklistId);
          tasks = tasks.concat(result);
        })
        .$promise,
        this.RestAPI.query({
          Type: 'tasklists',
          Id: _tasklistId,
          Path1: 'tasks',
          isDone: false,
          fields: this.queryFileds.taskFileds
        }, (data: ITaskData[]) => {
          let result: ITaskDataParsed[] = this.prepareTasks(data, _tasklistId);
          tasks = tasks.concat(result);
        })
        .$promise
      ])
      .then(() => {
        this.Cache.put(`tasks:in:${_tasklistId}`, tasks);
        return tasks;
      });
    }

    private prepareTasks (tasks: ITaskData[], tasklistId: string) {
      if (tasks.length) {
        let results: ITaskDataParsed[] = [];
        angular.forEach(tasks, (task: ITaskData, index: number) => {
          let result: ITaskDataParsed = this.taskParser(task);
          result.fetchTime = Date.now();
          this.Cache.put(`task:detail:${task._id}`, task);
          results.push(result);
        });
        return results;
      }else {
        return [];
      }
    }
  }

  angular.module('teambition').service('TasklistAPI', TasklistAPI);
}
