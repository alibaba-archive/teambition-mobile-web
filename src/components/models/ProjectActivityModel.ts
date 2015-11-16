/// <reference path="../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface IProjectActivityModel {
    setCollection(projectId: string, memberFilter: string, typeFilter: string,  content: IProjectActivitiesData[]): IProjectActivitiesDataParsed[];
    getCollection(projectId: string, memberFilter: string, typeFilter: string): IProjectActivitiesDataParsed[];
  }

  @inject([
    'PAParser'
  ])
  class ProjectActivityModel extends BaseModel implements IProjectActivityModel {

    private activitiesIndex = [];
    private PAParser: IPAParser;

    public setCollection(projectId: string, memberFilter: string, typeFilter: string,  content: IProjectActivitiesData[]) {
      let cacheIndex = `activities:${projectId}:${memberFilter}:${typeFilter}`;
      let result = this._get<IProjectActivitiesDataParsed[]>(cacheIndex);
      if (result) {
        for (let index = content.length - 1; index > 0; index--) {
          let activity = this.PAParser(content[index]);
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
        angular.forEach(parsedActivities, (activity: IActivityDataParsed, index: number) => {
          this.activitiesIndex.push(activity._id);
          this._set('project:activity', activity._id, activity);
        });
        this._set(cacheIndex, null, parsedActivities);
        return parsedActivities;
      }
    }

    public getCollection(projectId: string, memberFilter: string, typeFilter: string) {
      let cacheIndex = `activities:${projectId}:${memberFilter}:${typeFilter}`;
      let result = this._get<IProjectActivitiesDataParsed[]>(cacheIndex);
      return result;
    }

    private prepareActivities(activities: IProjectActivitiesData[], projectId: string, membersFilter: string, typesFilter: string): IProjectActivitiesDataParsed[] {
      if (activities && activities.length) {
        let _activities: IProjectActivitiesDataParsed [] = [];
        angular.forEach(activities, (activity: IProjectActivitiesData, index: number) => {
          let _activity: IProjectActivitiesDataParsed = this.PAParser(activity);
          _activities.push(_activity);
        });
        return _activities;
      }
    }
  }

  angular.module('teambition').service('ProjectActivityModel', ProjectActivityModel);
}
