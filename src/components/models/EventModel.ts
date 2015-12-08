'use strict';
import BaseModel from '../bases/BaseModel';
import {eventParser} from '../services/service';
import {IEventsResult, IEventData} from 'teambition';

class EventModel extends BaseModel {
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

  public addEvent(data: IEventData) {
    let collections = this.getProjectEventsCollection(data._projectId);
    let startDate = (typeof data.startDate === 'object') ? data.startDate.toString().substr(0, 10) : data.startDate.substr(0, 10);
    if (collections) {
      startDate = data.startDate.substr(0, 10);
      let group = collections.data[startDate];
      if (collections.index.indexOf(data._id) === -1) {
        if (group) {
          group.push(data);
        }else {
          collections.data[startDate] = [data];
        }
        collections.raw.push(data);
        collections.counter ++;
        collections.index.push(data._id);
      }
    }
  }

  public removeEvent(projectId: string, id: string) {
    let $rawData = this._get<IEventsResult>('events', projectId);
    let data = this._get<IEventData>('event:detail', id);
    if ($rawData) {
      let $index = $rawData.index;
      let position = $index.indexOf(id);
      if (position !== -1) {
        $rawData.counter --;
        let startDate = data.startDate.substr(0, 10);
        let dataCollection = $rawData.data[startDate];
        angular.forEach(dataCollection, (event: IEventData, index: number) => {
          if (event._id === id) {
            dataCollection.splice(index, 1);
          }
        });
      }
    }
  }

  private prepareEvents (_projectId: string, events: IEventData[]) {
    let results = <IEventsResult>{
      data: {},
      raw: null,
      index: [],
      counter: 0
    };
    if (events) {
      let raw: IEventData[] = [];
      let counter: number = 0;
      angular.forEach(events, (event: IEventData, index: number) => {
        let result: IEventData = eventParser(event);
        let startDate = event.startDate.substr(0, 10);
        let eventGroup: IEventData[] = results.data[startDate];
        if (eventGroup) {
          eventGroup.push(result);
        }else {
          results.data[startDate] = [];
          results.data[startDate].push(result);
          counter ++;
        }
        result.fetchTime = Date.now();
        raw.push(result);
        results.index.push(event._id);
        this._set(`event:detail`, event._id ,event);
      });
      results.counter = counter;
      results.raw = raw;
      return results;
    }else {
      return results;
    }
  }
}

export default new EventModel();
