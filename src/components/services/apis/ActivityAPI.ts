'use strict';
import BaseAPI from '../../bases/BaseAPI';
import ActivityModel from '../../models/ActivityModel';
import {IActivityData, IActivitySaveData} from 'teambition';
import {fields} from './fields';

export class ActivityAPI extends BaseAPI {

  public fetch (_boundToObjectType: string, _boundToObjectId: string) {
    let activities = ActivityModel.getByObjectId(_boundToObjectId);
    let deferred = this.$q.defer<IActivityData[]>();
    if (activities) {
      deferred.resolve(activities);
      return deferred.promise;
    }
    return this.RestAPI.query({
      Type: `${_boundToObjectType}s`,
      Id: _boundToObjectId,
      Path1: 'activities',
      fields: fields.activityFileds
    })
    .$promise
    .then((data: IActivityData[]) => {
      ActivityModel.setActivities(_boundToObjectId, data);
      return data;
    });
  }

  public save (data: IActivitySaveData) {
    return this.RestAPI.save({
      Type: 'activities'
    }, data)
    .$promise
    .then((activity: IActivityData) => {
      ActivityModel.addActivity(data._boundToObjectId, activity);
    });
  }
}

angular.module('teambition').service('ActivityAPI', ActivityAPI);
