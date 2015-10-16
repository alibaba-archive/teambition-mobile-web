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
        DAYLY: '天',
        WEEKLY: '周',
        MONTHLY: '月'
      };
      let freq = _arr[0].split('=')[1];
      let cycle: string;
      if (freq === '2') {
        cycle = '两';
      }
      let str = ruleMap[freq] + cycle;
      return `每${str}`;
    };
  });
}
