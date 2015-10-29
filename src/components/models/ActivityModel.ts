/// <reference path="../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface IActivityModel {
    getByObjectId(boundToObjectId: string): IActivityDataParsed[];
    setActivities(boundToObjectId: string, activities: IActivityDataParsed[]): void;
    addActivity(boundToObjectId: string, activity: IActivityDataParsed): void;
  }

  class ActivityModel extends BaseModel implements IActivityModel {
    private activitiesIndex: string[] = [];

    public getByObjectId(boundToObjectId: string) {
      return this._get<IActivityDataParsed[]>('activities', boundToObjectId);
    }

    public setActivities(boundToObjectId: string, activities: IActivityDataParsed[]) {
      let cache = this.getByObjectId(boundToObjectId);
      if (cache) {
        angular.forEach(activities, (activity: IActivityDataParsed, index: number) => {
          if (this.activitiesIndex.indexOf(activity._id) === -1) {
            cache.push(activity);
            this.activitiesIndex.push(activity._id);
          }
        });
        cache.sort((a: IActivityData, b: IActivityData) => a.created - b.created);
      }else {
        this._set('activities', boundToObjectId, activities);
        angular.forEach(activities, (activity: IActivityDataParsed, index: number) => {
          this.activitiesIndex.push(activity._id);
        });
        activities.sort((a: IActivityData, b: IActivityData) => a.created - b.created);
      }
    }

    public addActivity(boundToObjectId: string, activity: IActivityDataParsed) {
      let cache = this.getByObjectId(boundToObjectId);
      cache.push(activity);
      cache.sort((a: IActivityData, b: IActivityData) => a.created - b.created);
    }
  }

  angular.module('teambition').service('ActivityModel', ActivityModel);
}
