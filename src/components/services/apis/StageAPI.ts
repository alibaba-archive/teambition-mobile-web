'use strict';
import BaseAPI from '../../bases/BaseAPI';
import StageModel from '../../models/StageModel';
import {IStageData} from 'teambition';

export class StageAPI extends BaseAPI {

  public fetch (_id: string) {
    let cache = StageModel.getStages(_id);
    if (cache) {
      let deferred = this.$q.defer<IStageData[]>();
      deferred.resolve(cache);
      return deferred.promise;
    }
    return this.RestAPI.query(
      {
        Type: 'stages',
        _tasklistId: _id
      }
    )
    .$promise
    .then((data: IStageData[]) => {
      StageModel.setStages(_id, data);
      return data;
    });
  }
}

angular.module('teambition').service('StageAPI', StageAPI);
