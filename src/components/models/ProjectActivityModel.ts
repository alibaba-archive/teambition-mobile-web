/// <reference path="../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface IProjectActivityModel {
    setCollection(projectId: string, memberFilter: string, typeFilter: string,  content: IProjectActivitiesDataParsed[]): void;
    getCollection(projectId: string, memberFilter: string, typeFilter: string): IProjectActivitiesDataParsed[];
  }

  class ProjectActivityModel extends BaseModel implements IProjectActivityModel {

    private activitiesIndex = [];

    public setCollection(projectId: string, memberFilter: string, typeFilter: string,  content: IProjectActivitiesDataParsed[]) {
      let cacheIndex = `activities:${projectId}:${memberFilter}:${typeFilter}`;
      let result = this._get<IProjectActivitiesDataParsed[]>(cacheIndex);
      if (result) {
        for (let index = content.length - 1; index > 0; index--) {
          let activity = content[index];
          if (this.activitiesIndex.indexOf(activity._id) === -1) {
            this.activitiesIndex.push(activity._id);
            result.push(activity);
          }
        }
      }else {
        angular.forEach(content, (activity: IActivityDataParsed, index: number) => {
          this.activitiesIndex.push(activity._id);
        });
        this._set(cacheIndex, null, content);
      }
    }

    public getCollection(projectId: string, memberFilter: string, typeFilter: string) {
      let cacheIndex = `activities:${projectId}:${memberFilter}:${typeFilter}`;
      let result = this._get<IProjectActivitiesDataParsed[]>(cacheIndex);
      return result;
    }
  }

  angular.module('teambition').service('ProjectActivityModel', ProjectActivityModel);
}
