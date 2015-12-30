'use strict';
import BaseAPI from '../../bases/BaseAPI';
import SubtaskModel from '../../models/SubtaskModel';
import {ITaskData, ISubtaskData} from 'teambition';

export class SubtasksAPI extends BaseAPI {

  public fetch(taskId: string) {
    const subtasks = SubtaskModel.getFromTask(taskId);
    if (subtasks) {
      const deferred = this.$q.defer();
      deferred.resolve(subtasks);
      return deferred.promise;
    }
    return this.RestAPI.query({
      Type: 'subtasks',
      _taskId: taskId
    })
    .$promise
    .then((data: ISubtaskData[]) => {
      SubtaskModel.setFromTask(taskId, data);
      return data;
    });
  }

  public fetchOne(subtaskId: string) {
    const subtask = SubtaskModel.getOne(subtaskId);
    if (subtask) {
      const deferred = this.$q.defer();
      deferred.resolve(subtask);
      return deferred.promise;
    }else {
      return this.RestAPI.get({
        Type: 'subtasks',
        Id: subtaskId
      })
      .$promise
      .then((data: ISubtaskData) => {
        SubtaskModel.setOne(data);
        return data;
      });
    }
  }

  public update(_id: string, dataToUpdated: any, type?: string) {
    return this.RestAPI.update({
      Type: 'subtasks',
      Id: _id,
      Path1: type
    }, dataToUpdated)
    .$promise
    .then((data: ISubtaskData) => {
      SubtaskModel.updateSubtask(_id, data);
    });
  }

  public transform(subtaskId: string, doLink = false, doLinked = false) {
    return this.RestAPI.update({
      Type: 'subtasks',
      Id: subtaskId,
      Path1: 'transform'
    }, {
      doLink: doLink,
      doLinked: doLinked
    })
    .$promise
    .then((data: ITaskData) => {
      SubtaskModel.transform(subtaskId, data);
      return data;
    });
  }

  public create(content: string, _taskId: string, _executorId: string, dueDate?: string) {
    return this.RestAPI.save({
      Type: 'subtasks'
    }, {
      content: content,
      _taskId: _taskId,
      _executorId: _executorId,
      dueDate: dueDate
    })
    .$promise
    .then((data: ISubtaskData) => {
      SubtaskModel.setSubtask(data);
    });
  }

  public deleteOne(subtaskId: string) {
    return this.RestAPI.delete({
      Type: 'subtasks',
      Id: subtaskId
    })
    .$promise
    .then(() => {
      SubtaskModel.deleteOne(subtaskId);
    });
  }
}

angular.module('teambition').service('SubtasksAPI', SubtasksAPI);
