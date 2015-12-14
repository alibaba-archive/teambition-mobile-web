'use strict';
import BaseAPI from '../../bases/BaseAPI';
import SubtaskModel from '../../models/SubtaskModel';
import {ISubtaskData} from 'teambition';

export class SubtasksAPI extends BaseAPI {

  public fetch(_id: string) {
    let subtasks = SubtaskModel.getFromTask(_id);
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
      SubtaskModel.setFromTask(_id, data);
      return data;
    });
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

  public create(content: string, _taskId: string, _executorId: string) {
    return this.RestAPI.save({
      Type: 'subtasks'
    }, {
      content: content,
      _taskId: _taskId,
      _executorId: _executorId
    })
    .$promise
    .then((data: ISubtaskData) => {
      SubtaskModel.setSubtask(data);
    });
  }
}

angular.module('teambition').service('SubtasksAPI', SubtasksAPI);
