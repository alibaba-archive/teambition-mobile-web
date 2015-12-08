'use strict';
import {eventDate} from './eventDate';
import {formatFileSize} from './formatFileSize';
import {memberLimit} from './projectMemberLimit';
import {recurrenceStr} from './recurrenceStr';

export * from './eventDate';
export * from './formatFileSize';
export * from './projectMemberLimit';
export * from './recurrenceStr';

export const priorityStr = (priority: number = 0): string => {
  let map: string[] = ['普通', '紧急', '非常紧急'];
  return map[priority];
};

export const cutString = (str: string, len: number, suffix: string) => {
  if (typeof(str) !== 'string') {
    return '';
  }
  let index = 0;
  let count = 0;
  let result = '';
  while (count < len && index < str.length) {
    let chr = str.charAt(index++);
    count = /[\u4e00-\u9f85]/.test(str) ? count + 2 : count + 1;
    result += chr;
  }
  result = (index < str.length - 1) ? result + suffix : result;
  return result;
};

export const formatDate = (date: string, format: string): string => {
  let _date: number = new Date(date).valueOf();
  if (_date) {
    let differ: number = Date.now() - _date;
    if (format && format === 'calendar') {
      return moment(_date).calendar();
    }else if (format) {
      return moment(_date).format(format);
    }
    if (moment(_date).isSame(_date, 'year')) {
      return moment(_date).format('YYYY-MM-DD');
    }
    if (differ > 86400000) {
      return moment(_date).calendar();
    }
    return moment(_date).fromNow();
  }else {
    return '';
  }
};

angular.module('teambition')
.filter('formatDate', () => {
  return formatDate;
})
.filter('priorityStr', () => {
  return priorityStr;
})
.filter('cutString', () => {
  return cutString
})
.filter('eventDateFormat', () => {
  return eventDate;
})
.filter('formatFileSize', () => {
  return formatFileSize;
})
.filter('memberLimit', () => {
  return memberLimit;
})
.filter('recurrenceStr', () => {
  return recurrenceStr;
});
