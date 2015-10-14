/// <reference path="../interface/teambition.d.ts" />
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

  angular.module('teambition').factory('tasklistAPI',
  // @ngInject
  function(
    $q: angular.IQService,
    RestAPI: IRestAPI,
    Cache: angular.ICacheObject,
    taskParser: ITaskParser,
    queryFileds: IqueryFileds
  ) {
    var prepareTasks = (tasks: ITaskData[], tasklistId: string) => {
      if (tasks.length) {
        let results: ITaskDataParsed[] = [];
        angular.forEach(tasks, (task: ITaskData, index: number) => {
          let result: ITaskDataParsed = taskParser(task);
          result.fetchTime = Date.now();
          Cache.put(`task:detail:${task._id}`, result);
          results.push(result);
        });
        return results;
      }else {
        return [];
      }
    };

    return <ITasklistAPI>{
      fetch: (_id: string) => {
        let cache = Cache.get<ITasklistData>(`tasklist:${_id}`);
        let deferred = $q.defer<ITasklistData>();
        if (cache) {
          deferred.resolve(cache);
          return deferred.promise;
        }else {
          return RestAPI.get({
            Type: 'tasklists',
            Id: _id
          }, (data: ITasklistData) => {
            Cache.put(`tasklist:${_id}`, data);
            return data;
          })
          .$promise;
        }
      },

      fetchAll: (_projectId: string) => {
        let tasklists: ITasklistData[] = Cache.get<ITasklistData[]>(`tasklists:${_projectId}`);
        let deferred = $q.defer<ITasklistData[]>();
        if (tasklists) {
          deferred.resolve(tasklists);
          return deferred.promise;
        }
        return RestAPI.query({
          Type: 'tasklists',
          _projectId: _projectId
        }, (tasklists: ITaskData[]) => {
          angular.forEach(tasklists, (tasklist: ITasklistData, index: number) => {
            Cache.put(`tasklist:${tasklist._id}`, tasklist);
          });
          Cache.put(`tasklists:${_projectId}`, tasklists);
        })
        .$promise;
      },

      fetchTasksByTasklistId: (_tasklistId: string) => {
        let cache: ITaskDataParsed[] = Cache.get<ITaskDataParsed[]>(`tasks:in:${_tasklistId}`);
        let deferred = $q.defer<ITaskDataParsed[]>();
        if (cache) {
          deferred.resolve(cache);
          return deferred.promise;
        }
        let tasks = [];
        let fetchTime: number = 0;
        return $q.all([
          RestAPI.query({
            Type: 'tasklists',
            Id: _tasklistId,
            Path1: 'tasks',
            isDone: true,
            fields: queryFileds.taskFileds
          }, (data: ITaskData[]) => {
            fetchTime ++;
            let result: ITaskDataParsed[] = prepareTasks(data, _tasklistId);
            tasks = tasks.concat(result);
          })
          .$promise,
          RestAPI.query({
            Type: 'tasklists',
            Id: _tasklistId,
            Path1: 'tasks',
            isDone: false,
            fields: queryFileds.taskFileds
          }, (data: ITaskData[]) => {
            let result: ITaskDataParsed[] = prepareTasks(data, _tasklistId);
            tasks = tasks.concat(result);
          })
          .$promise
        ])
        .then(() => {
          Cache.put(`tasks:in:${_tasklistId}`, tasks);
          return tasks;
        });
      }
    };
  });
}
