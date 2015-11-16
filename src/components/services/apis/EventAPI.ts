/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';
  export interface IEventAPI {
    fetch(_projectId: string, startDate?: string, endDate?: string): angular.IPromise<IEventsResult>;
  }

  export interface IEventsResult {
    data: {
      [index: string]: IEventDataParsed[];
    };
    raw: IEventDataParsed[];
    counter: number;
  }

  @inject([
    'EventModel'
  ])
  class EventAPI extends BaseAPI implements IEventAPI {
    private EventModel: IEventModel;

    public fetch (_projectId: string, startDate: string = new Date().toISOString(), endDate?: string) {
      let cache = this.EventModel.getProjectEventsCollection(_projectId);
      let deferred = this.$q.defer<IEventsResult>();
      if (cache) {
        deferred.resolve(cache);
        return deferred.promise;
      }else {
        return this.RestAPI.query({
          Type: 'projects',
          Id: _projectId,
          Path1: 'events',
          startDate: startDate,
          endDate: endDate,
          fields: this.queryFileds.eventFileds
        })
        .$promise
        .then((events: IEventData[]) => {
          let result = this.EventModel.setProjectEventsCollection(_projectId, events);
          return result;
        });
      }
    }
  }

  angular.module('teambition').service('EventAPI', EventAPI);
}
