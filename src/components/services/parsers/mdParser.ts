/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export type IMdParser = (md: string) => string;

  angular.module('teambition').factory('mdParser',
  // @ngInject
  function(Marked: MarkedStatic) {
    return <IMdParser>(md: string) => {
      if (angular.isString(md)) {
        return Marked(md);
      }
    };
  });
}
