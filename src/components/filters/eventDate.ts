/// <reference path='../interface/teambition.d.ts' />
module teambition {
  'use strict';
  angular.module('teambition').filter('eventDateFormat',
  // @ngInject
  (
    Moment: moment.MomentStatic
  ) => {
    return (date1: string, date2: string): string => {
      let start: number = new Date(date1).valueOf();
      let end: number   = new Date(date2).valueOf();
      if (end - start < 86400000) {
        return Moment(date1).format('HH:mm') + ' ~ ' +
              Moment(date2).format('HH:mm');
      }else {
        if (Moment().isSame(date1, 'day')) {
          let end: moment.Moment = Moment(date2);
          return Moment(date1).format('HH:mm') + '~' +
                end.calendar() + ' ' + end.format('HH:mm');
        }else if (Moment().isSame(date1, 'day')) {
          let start: moment.Moment = Moment(date2);
          return start.calendar() + ' ' + start.format('HH:mm') + ' ~ ' +
                Moment(date2).format('HH:mm');
        }else {
          let start: moment.Moment = Moment(date1);
          let end: moment.Moment = Moment(date2);
          return start.calendar() + ' ' + start.format('HH:mm') + ' ~ ' +
                end.calendar() + ' ' + end.format('HH:mm');
        }
      }
    };
  });
}
