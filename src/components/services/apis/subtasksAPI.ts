/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface ISubtaskData {
    _id: string;
    _projectId: string;
    _creatorId: string;
    content: string;
    isDone: boolean;
    _executorId: string;
    _taskId: string;
    dueDate: string;
    order: number;
    exector: IMemberData;
  }

  export interface ISubtasksAPI {
    fetch(_taskId: string): angular.IPromise<ISubtaskData[]>;
  }

  angular.module('teambition').factory('subtasksAPI',
  // @ngInject
  (
    $q: angular.IQService,
    RestAPI: IRestAPI,
    Cache: angular.ICacheObject
  ) => {
    return {
      fetch: (_id: string) => {
        let cacheId = `task:subtask:${_id}`;
        let subtasks = Cache.get<ISubtaskData[]>(cacheId);
        let deferred = $q.defer();
        if (subtasks) {
          deferred.resolve(subtasks);
          return deferred.promise;
        }
        return RestAPI.query({
          Type: 'subtasks',
          _taskId: _id
        })
        .$promise
        .then((data: ISubtaskData[]) => {
          Cache.put(cacheId, data);
          return data;
        });
      },
      update: (_id: string, task: ITaskDataParsed, dataToUpdated: any) => {
        return RestAPI.update({
          Type: 'subtasks',
          Id: _id
        }, dataToUpdated)
        .$promise
        .then((data: ISubtaskData) => {
          let doneCount = task.subtaskCount.done;
          if (data.isDone) {
            doneCount += 1;
          }else {
            doneCount -= 1;
          }
          task.subtaskCount.done = doneCount;
          Cache.put(`task:detail:${task._id}`, task);
          return task;
        });
      }
    };
  });
}
