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

  @inject([
    'arrayMerge',
    'activityParser',
    'Cache'
  ])
  class ActivityAPI extends BaseAPI implements IActivityAPI {
    private arrayMerge: IArrayMerge;
    private activityParser: IActivityParser;
    private Cache: angular.ICacheObject;

    public fetch (_boundToObjectType: string, _boundToObjectId: string) {
      let cacheId = `activities:${_boundToObjectId}`;
      let activities = this.Cache.get<IActivityDataParsed[]>(cacheId) || [];
      let result = [];
      let deferred = this.$q.defer();
      if (activities.length) {
        deferred.resolve(activities);
        return deferred.promise;
      }
      return this.RestAPI.query({
        Type: 'activities',
        boundToObjectType: _boundToObjectType,
        _boundToObjectId: _boundToObjectId,
        fields: this.queryFileds.activityFileds
      })
      .$promise
      .then((data: IActivityData[]) => {
        let results = this.prepareResult(result, data);
        this.Cache.put(cacheId, results);
        return results;
      });
    }

    public save (data: IActivitySaveData) {
      let cacheId = `activities:${data._boundToObjectId}`;
      let activities = this.Cache.get<IActivityDataParsed[]>(cacheId) || [];
      return this.RestAPI.save({
        Type: 'activities'
      }, data)
      .$promise
      .then((activity: IActivityData) => {
        this.arrayMerge(activities, [activity]);
        this.Cache.put(cacheId, activities);
        let result = this.activityParser(activity);
        return result;
      });
    }

    private prepareResult (result: IActivityData[], activities: IActivityData []) {
      result = result.length ? result : [];
      angular.forEach(activities, (activity: IActivityData, index: number) => {
        let parsed = this.activityParser(activity);
        result.push(parsed);
      });
      return result.sort((a: IActivityData, b: IActivityData) => a.created - b.created);
    }
  }

  angular.module('teambition').service('ActivityAPI', ActivityAPI);
}
