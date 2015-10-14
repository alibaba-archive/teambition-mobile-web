/// <reference path="../interface/teambition.d.ts" />
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

  angular.module('teambition').factory('eventAPI',
  // @ngInject
  function(
    $q: angular.IQService,
    RestAPI: IRestAPI,
    Cache: angular.ICacheObject,
    eventParser: IEventParser,
    queryFileds: IqueryFileds
  ) {

      function prepareEvents (events: IEventData[], _projectId: string) {
        if (events) {
          let results = <IEventsResult>{
            data: {},
            raw: null,
            counter: 0
          };
          let raw: IEventDataParsed[] = [];
          let counter: number = 0;
          angular.forEach(events, (event: IEventData, index: number) => {
            let result: IEventDataParsed = eventParser(event);
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
            Cache.put(`event:detail:${event._id}`, result);
          });
          results.counter = counter;
          results.raw = raw;
          Cache.put(`events:${_projectId}`, results);
          return results;
        }else {
          Cache.put(`events:${_projectId}`, []);
          return <IEventsResult>{
            data: null,
            raw: [],
            counter: 0
          };
        }
      }

      return {
        fetch: (_projectId: string, startDate: string = new Date().toISOString(), endDate?: string) => {
          let cache = Cache.get<IEventsResult>(`events:${_projectId}`);
          let deferred = $q.defer<IEventsResult>();
          if (cache) {
            deferred.resolve(cache);
            return deferred.promise;
          }else {
            return RestAPI.query({
              Type: 'projects',
              Id: _projectId,
              Path1: 'events',
              startDate: startDate,
              endDate: endDate,
              fields: queryFileds.eventFileds
            })
            .$promise
            .then((events: IEventData[]) => {
              let result = prepareEvents(events, _projectId);
              return result;
            });
          }
        }
      };
  });
}
