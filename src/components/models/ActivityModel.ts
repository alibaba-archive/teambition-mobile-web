'use strict';
import BaseModel from '../bases/BaseModel';
import {activityParser} from '../services';
import {IActivityData} from 'teambition';

class ActivityModel extends BaseModel {
  private activitiesIndex: string[] = [];

  public getByObjectId(boundToObjectId: string) {
    return this._get<IActivityData[]>('activities', boundToObjectId);
  }

  public setActivities(boundToObjectId: string, activities: IActivityData[]) {
    let cache = this.getByObjectId(boundToObjectId);
    if (cache) {
      angular.forEach(activities, (activity: IActivityData, index: number) => {
        if (this.activitiesIndex.indexOf(activity._id) === -1) {
          cache.push(activityParser(activity));
          this.activitiesIndex.push(activity._id);
        }
      });
      cache.sort((a: IActivityData, b: IActivityData) => a.created - b.created);
    }else {
      this._set('activities', boundToObjectId, activities);
      angular.forEach(activities, (activity: IActivityData, index: number) => {
        this.activitiesIndex.push(activity._id);
        activities[index] = activityParser(activity);
      });
      activities.sort((a: IActivityData, b: IActivityData) => a.created - b.created);
    }
  }

  public addActivity(boundToObjectId: string, activity: IActivityData) {
    let cache = this.getByObjectId(boundToObjectId);
    if (cache instanceof Array) {
      activityParser(activity);
      cache.push(activity);
      cache.sort((a: IActivityData, b: IActivityData) => a.created - b.created);
    }
  }
}

export default new ActivityModel();
