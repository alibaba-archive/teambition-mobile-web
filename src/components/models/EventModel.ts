/// <reference path="../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface IEventModel extends IDetailModel {
    getProjectEventsCollection(projectId: string): IEventsResult;
    setProjectEventsCollection(projectId: string, collection: IEventsResult): void;
  }

  class EventModel extends DetailModel implements IEventModel {
    public getProjectEventsCollection(projectId: string) {
      return this._get<IEventsResult>('events', projectId);
    }

    public setProjectEventsCollection(projectId: string, collection: IEventsResult) {
      let cache = this.getProjectEventsCollection(projectId);
      if (!cache) {
        this._set('events', projectId, collection);
      }
    }
  }

  angular.module('teambition').service('EventModel', EventModel);
}
