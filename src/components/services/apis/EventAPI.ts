'use strict';
import BaseAPI from '../../bases/BaseAPI';
import EventModel from '../../models/EventModel';
import {IEventData, IEventsResult} from 'teambition';

export class EventAPI extends BaseAPI {

  public fetch (_projectId: string, startDate: string = new Date().toISOString(), endDate?: string) {
    let cache = EventModel.getProjectEventsCollection(_projectId);
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
        fields: this.fields.eventFileds
      })
      .$promise
      .then((events: IEventData[]) => {
        let result = EventModel.setProjectEventsCollection(_projectId, events);
        return result;
      });
    }
  }
}

angular.module('teambition').service('EventAPI', EventAPI);
