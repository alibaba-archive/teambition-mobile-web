/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface IActivitySaveData {
    _boundToObjectId: string;
    attachments: string[];
    boundToObjectType: string;
    content: string;
  }

  export interface IActivityAPI {
    fetch(_boundToObjectType: string, _boundToObjectId: string): angular.IPromise<IActivityDataParsed[]>;
    save(data: IActivitySaveData): angular.IPromise<IActivityDataParsed>;
  }

  angular.module('teambition').factory('activityAPI',
  // @ngInject
  (
    $q: angular.IQService,
    RestAPI: IRestAPI,
    arrayMerge: IArrayMerge,
    activityParser: IActivityParser,
    Cache: angular.ICacheObject,
    queryFileds: IqueryFileds
  ) => {

    let prepareResult = (result: IActivityData[], activities: IActivityData []) => {
      result = result.length ? result : [];
      angular.forEach(activities, (activity: IActivityData, index: number) => {
        let parsed = activityParser(activity);
        result.push(parsed);
      });
      return result.sort((a: IActivityData, b: IActivityData) => a.created - b.created);
    };

    return {
      fetch: (_boundToObjectType: string, _boundToObjectId: string) => {
        let cacheId = `activities:${_boundToObjectId}`;
        let activities = Cache.get<IActivityDataParsed[]>(cacheId) || [];
        let result = [];
        let deferred = $q.defer();
        if (activities.length) {
          deferred.resolve(activities);
          return deferred.promise;
        }
        return RestAPI.query({
          Type: 'activities',
          boundToObjectType: _boundToObjectType,
          _boundToObjectId: _boundToObjectId,
          fields: queryFileds.activityFileds
        })
        .$promise
        .then((data: IActivityData[]) => {
          let results = prepareResult(result, data);
          Cache.put(cacheId, results);
          return results;
        });
      },
      save: (data: IActivitySaveData) => {
        let cacheId = `activities:${data._boundToObjectId}`;
        let activities = Cache.get<IActivityDataParsed[]>(cacheId) || [];
        return RestAPI.save({
          Type: 'activities'
        }, data)
        .$promise
        .then((activity: IActivityData) => {
          arrayMerge(activities, [activity]);
          Cache.put(cacheId, activities);
          let result = activityParser(activity);
          return result;
        });
      }
    };
  });
}
