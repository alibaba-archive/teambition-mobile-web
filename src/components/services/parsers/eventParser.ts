'use strict';
import {getDeps} from '../../bases/Utils';
import {mdParser} from './mdParser';
import {IEventData} from 'teambition';

export const eventParser = (event: IEventData) => {
  event.contentToDisplay = event.content;
  event.contentToDisplay = mdParser(event.contentToDisplay);
  let $sanitize = getDeps('$sanitize');
  event.contentToDisplay = $sanitize(event.contentToDisplay);
  event.recurrenceTime = event.recurrence ? event.recurrence[0] : undefined;
  if (event.startDate instanceof Date) {
    event.startDate = event.startDate.toISOString();
  }
  if (event.endDate instanceof Date) {
    event.endDate = event.endDate.toISOString();
  }
  let startDate = moment(event.startDate);
  let endDate = moment(event.endDate);
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
