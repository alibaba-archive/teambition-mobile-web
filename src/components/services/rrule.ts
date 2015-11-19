/// <reference path="../interface/teambition.d.ts" />
module teambition {
	'use strict';
	export interface IRrule {
    timeToUntilString: (time: any) => string;
  }

	angular.module('teambition').factory('Rrule', [
		(): IRrule => {
			return {
        timeToUntilString: (time: any) => {
          let date = new Date(time);
          let comp, comps = [
            date.getUTCFullYear(),
            date.getUTCMonth() + 1,
            date.getUTCDate(),
            'T',
            date.getUTCHours(),
            date.getUTCMinutes(),
            date.getUTCSeconds(),
            'Z'
          ];
          for (let i = 0; i < comps.length; i++) {
            comp = comps[i];
            if (!/[TZ]/.test(comp) && comp < 10) {
                comps[i] = '0' + String(comp);
            }
          }
          return comps.join('');
        }
      };
		}
	]);
}
