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
    'eventParser',
    'Cache'
  ])
  class EventAPI extends BaseAPI implements IEventAPI {
    private eventParser: IEventParser;
    private Cache: angular.ICacheObject;

    public fetch (_projectId: string, startDate: string = new Date().toISOString(), endDate?: string) {
      let cache = this.Cache.get<IEventsResult>(`events:${_projectId}`);
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
          let result = this.prepareEvents(events, _projectId);
          return result;
        });
      }
    }

    private prepareEvents (events: IEventData[], _projectId: string) {
      if (events) {
        let results = <IEventsResult>{
          data: {},
          raw: null,
          counter: 0
        };
        let raw: IEventDataParsed[] = [];
        let counter: number = 0;
        angular.forEach(events, (event: IEventData, index: number) => {
          let result: IEventDataParsed = this.eventParser(event);
          let eventGroup: IEventDataParsed[] = results.data[event.startDate];
          if (eventGroup) {
            eventGroup.push(result);
          }else {
            results.data[event.startDate] = [];
            results.data[event.startDate].push(result);
            counter ++;
          }
          result.fetchTime = Date.now();
          raw.push(result);
          this.Cache.put(`event:detail:${event._id}`, event);
        });
        results.counter = counter;
        results.raw = raw;
        this.Cache.put(`events:${_projectId}`, results);
        return results;
      }else {
        this.Cache.put(`events:${_projectId}`, []);
        return <IEventsResult>{
          data: null,
          raw: [],
          counter: 0
        };
      }
    }
  }

  angular.module('teambition').service('EventAPI', EventAPI);
}
