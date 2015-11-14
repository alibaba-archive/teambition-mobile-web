/// <reference path='../interface/teambition.d.ts' />
module teambition {
  'use strict';
  angular.module('teambition').filter('recurrenceStr', () => {
    return (rule: string) => {
      if (!rule || rule === '') {
        return '从不';
      }
      rule = rule.replace('RRULE:', '');
      let ruleArr = rule.split(';');
      let ruleMap = {};
      angular.forEach(ruleArr, (childRule: string) => {
        let childRuleMap = childRule.split('=');
        ruleMap[childRuleMap[0]] = childRuleMap[1];
      });
      let str: string;
      switch (ruleMap['FREQ']) {
        case 'WEEKLY':
          if (ruleMap['INTERVAL'] === 2) {
            str = '两周';
          }else {
            str = '周';
          }
          break;
        case 'DAILY':
          str = '天';
          break;
        case 'MONTHLY':
          str = '月';
          break;
      }
      return `每${str}`;
    };
  });
}
