/// <reference path="../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface IEventModel extends IDetailModel {
    addEvent(data: IEventDataParsed): void;
    getProjectEventsCollection(projectId: string): IEventsResult;
    setProjectEventsCollection(projectId: string, collection: IEventData[]): IEventsResult;
  }

  class EventModel extends DetailModel implements IEventModel {
    public getProjectEventsCollection(projectId: string) {
      return this._get<IEventsResult>('events', projectId);
    }

    public setProjectEventsCollection(projectId: string, collection: IEventData[]) {
      let cache = this.getProjectEventsCollection(projectId);
      let result = this.prepareEvents(projectId, collection);
      if (!cache) {
        this._set('events', projectId, result);
      }
      return result;
    }

    public addEvent(data: IEventDataParsed) {
      let collections = this.getProjectEventsCollection(data._projectId);
      if (collections) {
        let group = collections.data[data.startDate];
        if (group) {
          group.push(data);
        }else {
          collections.data[data.startDate] = [data];
        }
        collections.raw.push(data);
        collections.counter ++;
      }
    }

    private prepareEvents (_projectId: string, events: IEventData[]) {
      let results = <IEventsResult>{
        data: {},
        raw: null,
        counter: 0
      };
      if (events) {
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
          this.setDetail(`event:detail:${event._id}`, event);
        });
        results.counter = counter;
        results.raw = raw;
        return results;
      }else {
        return results;
      }
    }
  }

  angular.module('teambition').service('EventModel', EventModel);
}
