/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface IEventDataParsed extends IEventData {
    contentToDisplay: string;
    eventTime1: string;
    eventTime2: string;
    recurrenceTime: string;
    fetchTime?: number;
    linked?: ILinkedData[];
    isLike?: boolean;
    likedPeople?: string;
    likesCount?: number;
  }

  export interface IEventParser {
    (event: IEventData | IEventDataParsed): IEventDataParsed;
  }

  angular.module('teambition').factory('eventParser',
  // @ngInject
  function(
    $sanitize: (html: string) => string,
    mdParser: (str: string) => string,
    Moment: moment.MomentStatic
  ) {
    return function(event: IEventDataParsed): IEventDataParsed {
      event.contentToDisplay = event.content;
      event.contentToDisplay = mdParser(event.contentToDisplay);
      event.contentToDisplay = $sanitize(event.contentToDisplay);
      event.recurrenceTime = event.recurrence ? event.recurrence[0] : undefined;
      if (event.startDate instanceof Date) {
        event.startDate = event.startDate.toISOString();
      }
      if (event.endDate instanceof Date) {
        event.endDate = event.endDate.toISOString();
      }
      let startDate = Moment(event.startDate);
      let endDate = Moment(event.endDate);
      endDate = endDate ? endDate : endDate.clone().add(1, 'hours');
      if (startDate.isSame(endDate, 'day')) {
        event.eventTime1 = startDate.format('LT') + ' ~ ' + endDate.format('LT');
        event.eventTime2 = startDate.format('LL');
      }else {
        event.eventTime1 = startDate.format('LLL');
        event.eventTime2 = startDate.format('LLL');
      }
      event.updated = new Date(event.updated).valueOf() + '';
      return event;
    };
  });
}
