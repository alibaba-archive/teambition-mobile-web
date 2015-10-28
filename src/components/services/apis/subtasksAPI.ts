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
    update(_id: string, task: ITaskDataParsed, dataToUpdated: any): angular.IPromise<ITaskDataParsed>;
  }

  @inject([
    'Cache'
  ])
  class SubtasksAPI extends BaseAPI implements ISubtasksAPI {
    private Cache: angular.ICacheObject;

    public fetch(_id: string) {
      let cacheId = `task:subtask:${_id}`;
      let subtasks = this.Cache.get<ISubtaskData[]>(cacheId);
      let deferred = this.$q.defer();
      if (subtasks) {
        deferred.resolve(subtasks);
        return deferred.promise;
      }
      return this.RestAPI.query({
        Type: 'subtasks',
        _taskId: _id
      })
      .$promise
      .then((data: ISubtaskData[]) => {
        this.Cache.put(cacheId, data);
        return data;
      });
    }

    public update(_id: string, task: ITaskDataParsed, dataToUpdated: any) {
      return this.RestAPI.update({
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
        this.Cache.put(`task:detail:${task._id}`, task);
        return task;
      });
    }
  }

  angular.module('teambition').service('SubtasksAPI', SubtasksAPI);
}
