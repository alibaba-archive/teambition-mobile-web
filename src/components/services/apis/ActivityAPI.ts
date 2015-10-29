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
    save(data: IActivitySaveData): angular.IPromise<void>;
  }

  @inject([
    'ActivityModel',
    'activityParser'
  ])
  class ActivityAPI extends BaseAPI implements IActivityAPI {
    private ActivityModel: IActivityModel;
    private activityParser: IActivityParser;

    public fetch (_boundToObjectType: string, _boundToObjectId: string) {
      let activities = this.ActivityModel.getByObjectId(_boundToObjectId);
      let deferred = this.$q.defer<IActivityDataParsed[]>();
      if (activities) {
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
        let result = [];
        this.prepareResult(result, data);
        this.ActivityModel.setActivities(_boundToObjectId, result);
        return result;
      });
    }

    public save (data: IActivitySaveData) {
      return this.RestAPI.save({
        Type: 'activities'
      }, data)
      .$promise
      .then((activity: IActivityData) => {
        let result = this.activityParser(activity);
        this.ActivityModel.addActivity(data._boundToObjectId, result);
      });
    }

    private prepareResult (result: IActivityData[], activities: IActivityData []) {
      result = result ? result : [];
      angular.forEach(activities, (activity: IActivityData, index: number) => {
        let parsed = this.activityParser(activity);
        result.push(parsed);
      });
    }
  }

  angular.module('teambition').service('ActivityAPI', ActivityAPI);
}
