/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface IEventDataParsed extends IEventData {
    parsed: boolean;
    originContent: string;
    eventTime1: string;
    eventTime2: string;
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
      if (event.parsed) {
        return event;
      }
      event.location = event.location ? event.location : '暂未安排地点';
      event.originContent = event.content;
      event.content = mdParser(event.content);
      event.content = $sanitize(event.content);
      let startDate: moment.Moment = Moment(event.startDate);
      let endDate: moment.Moment = Moment(event.endDate);
      endDate = endDate ? endDate : endDate.clone().add(1, 'hours');
      if (startDate.isSame(endDate, 'day')) {
        event.eventTime1 = startDate.format('LT') + ' ~ ' + endDate.format('LT');
        event.eventTime2 = startDate.format('LL');
      }else {
        event.eventTime1 = startDate.format('LLL');
        event.eventTime2 = startDate.format('LLL');
      }
      event.updated = new Date(event.updated).valueOf() + '';
      event.parsed = true;
      return event;
    };
  });
}
