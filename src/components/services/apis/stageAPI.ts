/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';
  export interface IStageAPI {
    fetch(_tasklistId: string): angular.IPromise<IStageData[]>;
  }

  export interface IStageData {
    _id: string;
    name: string;
    _creatorId: string;
    _tasklistId: string;
    _projectId: string;
    isArchived: boolean;
    totalCount: number;
    order: number;
  }

  @inject([
    'Cache'
  ])
  class StageAPI extends BaseAPI implements IStageAPI {
    private Cache: angular.ICacheObject;

    public fetch (_id: string) {
      let cache = this.Cache.get<IStageData[]>(`stages:tasklist:${_id}`);
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
        angular.forEach(data, (stage: IStageData, index: number) => {
          this.Cache.put(`stages:detail:${stage._id}`, stage);
        });
        this.Cache.put(`stages:tasklist:${_id}`, data);
        return data;
      });
    }
  }

  angular.module('teambition').service('StageAPI', StageAPI);
}
