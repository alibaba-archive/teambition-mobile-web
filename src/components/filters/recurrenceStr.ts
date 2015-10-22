/// <reference path='../interface/teambition.d.ts' />
module teambition {
  'use strict';
  angular.module('teambition').filter('recurrenceStr', () => {
    return (rule: string) => {
      let _rule = rule || '';
      if (_rule === '') {
        return '从不';
      }
      let _arr = _rule.split(';');
      let ruleMap = {
        DAILY: '天',
        WEEKLY: '周',
        MONTHLY: '月'
      };
      let freq = _arr[0].split('=')[1];
      let cycle = _arr[1].split('=')[1];
      if (cycle === '2') {
        cycle = '两';
      }else {
        cycle = '';
      }
      let str = cycle + ruleMap[freq];
      return `每${str}`;
    };
  });
}
