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

  angular.module('teambition').factory('stageAPI',
    // @ngInject
    (
      $q: angular.IQService,
      RestAPI: teambition.IRestAPI,
      Cache: angular.ICacheObject
    ) => {
      var stageAPI: IStageAPI;
      return stageAPI = {
        fetch: (_id: string) => {
          let cache = Cache.get<IStageData[]>(`stages:tasklist:${_id}`);
          if (cache) {
            let deferred = $q.defer<IStageData[]>();
            deferred.resolve(cache);
            return deferred.promise;
          }
          return RestAPI.query(
            {
              Type: 'stages',
              _tasklistId: _id
            }
          )
          .$promise
          .then((data: IStageData[]) => {
            angular.forEach(data, (stage: IStageData, index: number) => {
              Cache.put(`stages:detail:${stage._id}`, stage);
            });
            Cache.put(`stages:tasklist:${_id}`, data);
            return data;
          });
        }
      };
    }
  );
}
