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
    'ActivityModel'
  ])
  class ActivityAPI extends BaseAPI implements IActivityAPI {
    private ActivityModel: IActivityModel;

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
      .then((data: IActivityDataParsed[]) => {
        this.ActivityModel.setActivities(_boundToObjectId, data);
        return data;
      });
    }

    public save (data: IActivitySaveData) {
      return this.RestAPI.save({
        Type: 'activities'
      }, data)
      .$promise
      .then((activity: IActivityDataParsed) => {
        this.ActivityModel.addActivity(data._boundToObjectId, activity);
      });
    }
  }

  angular.module('teambition').service('ActivityAPI', ActivityAPI);
}
