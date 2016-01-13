export default angular.module('teambition')
.directive('autoFocus', ['$timeout', (
  $timeout: angular.ITimeoutService
) => {
  'use strict';
  return {
    link: (
      scope: angular.IScope,
      element: Element,
      attrs: Attr
    ) => {
      $timeout(() => {
        element[0].focus();
      });
    }
  };
}]);
