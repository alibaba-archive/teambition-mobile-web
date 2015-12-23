'use strict';
import BaseModel from '../bases/BaseModel';
import {PAParser} from '../services';
import {IProjectActivitiesData, IActivityData} from 'teambition';

class ProjectActivityModel extends BaseModel {

  private activitiesIndex = [];

  public setCollection(projectId: string, memberFilter: string, typeFilter: string,  content: IProjectActivitiesData[]) {
    let cacheIndex = `activities:${projectId}:${memberFilter}:${typeFilter}`;
    let result = this._get<IProjectActivitiesData[]>(cacheIndex);
    if (result) {
      for (let index = content.length - 1; index > 0; index--) {
        let activity = PAParser(content[index]);
        if (this.activitiesIndex.indexOf(activity._id) === -1) {
          this.activitiesIndex.push(activity._id);
          result.push(activity);
          this._set('project:activity', activity._id, activity);
        }else {
          this._updateObj('project:activity', activity._id, activity);
        }
      }
      return result;
    }else {
      let parsedActivities = this.prepareActivities(content, projectId, memberFilter, typeFilter);
      angular.forEach(parsedActivities, (activity: IActivityData, index: number) => {
        this.activitiesIndex.push(activity._id);
        this._set('project:activity', activity._id, activity);
      });
      this._set(cacheIndex, null, parsedActivities);
      return parsedActivities;
    }
  }

  public getCollection(projectId: string, memberFilter: string, typeFilter: string) {
    let cacheIndex = `activities:${projectId}:${memberFilter}:${typeFilter}`;
    let result = this._get<IProjectActivitiesData[]>(cacheIndex);
    return result;
  }

  private prepareActivities(activities: IProjectActivitiesData[], projectId: string, membersFilter: string, typesFilter: string): IProjectActivitiesData[] {
    if (activities && activities.length) {
      let _activities: IProjectActivitiesData [] = [];
      angular.forEach(activities, (activity: IProjectActivitiesData, index: number) => {
        let _activity: IProjectActivitiesData = PAParser(activity);
        _activities.push(_activity);
      });
      return _activities;
    }
  }
}

export default new ProjectActivityModel();
