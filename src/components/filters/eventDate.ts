/// <reference path='../interface/teambition.d.ts' />
module teambition {
  'use strict';
  angular.module('teambition').filter('eventDateFormat',
  // @ngInject
  (
    Moment: moment.MomentStatic
  ) => {
    return (date1: string, date2: string, eventTitle?: string): string => {
      let start = new Date(date1).valueOf();
      let end   = new Date(date2).valueOf();
      let dateString: string;
      let result: string;
      if (Moment(start).isSame(end + '', 'day')) {
        dateString = `${Moment(date1).format('HH:mm')} ~ ${Moment(date2).format('HH:mm')}`;
      }else {
        if (Moment().isSame(date1, 'day')) {
          let end = Moment(date2);
          dateString = `今天 ${Moment(date1).format('HH:mm')} ~ ${end.calendar()} ${end.format('HH:mm')}`;
        }else if (Moment().isSame(date2, 'day')) {
          let start = Moment(date2);
          dateString = `${start.calendar()} ${start.format('HH:mm')} ~ 今天 ${Moment(date2).format('HH:mm')}`;
        }else {
          let start = Moment(date1);
          let end = Moment(date2);
          dateString = `${start.calendar()} ${start.format('HH:mm')} ~ ${end.calendar()} ${end.format('HH:mm')}`;
        }
      }
      result = dateString;
      if (eventTitle) {
        let length = eventTitle.length + dateString.length;
        if (length > 30) {
          if (eventTitle.length > 30) {
            result = '';
          }else {
            let newLength = 30 - eventTitle.length;
            result = dateString.substring(0, newLength + 1) + '...';
          }
        }
      }else {
        let length = dateString.length;
        if (length > 30) {
          result = dateString.substring(0, 30) + '...';
        }
      }
      return result;
    };
  });
}
