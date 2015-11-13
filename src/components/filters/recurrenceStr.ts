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
        MONTHLY: '月',
        BYDAY: 'FR'
      };
      let freq = _arr[0];
      freq = freq ? freq.split('=')[1] : freq;
      let cycle = _arr[1];
      cycle = cycle ? cycle.split('=')[1] : cycle;
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
