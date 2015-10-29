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
    update(_id: string, task: ITaskDataParsed, dataToUpdated: any): angular.IPromise<any>;
  }

  @inject([
    'SubtaskModel',
    'TaskModel'
  ])
  class SubtasksAPI extends BaseAPI implements ISubtasksAPI {
    private SubtaskModel: ISubtaskModel;

    public fetch(_id: string) {
      let subtasks = this.SubtaskModel.getFromTask(_id);
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
        this.SubtaskModel.setFromTask(_id, data);
        angular.forEach(data, (subtask: ISubtaskData, index: number) => {
          this.SubtaskModel.setSubtask(subtask);
        });
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
        this.SubtaskModel.updateSubtask(_id, data);
      });
    }
  }

  angular.module('teambition').service('SubtasksAPI', SubtasksAPI);
}
