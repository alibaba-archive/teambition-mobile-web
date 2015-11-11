/// <reference path="../interface/teambition.d.ts" />
module teambition {
  'use strict';
  angular.module('teambition').config(
    // @ngInject
    (
      $stateProvider: angular.ui.IStateProvider,
      $urlRouterProvider: angular.ui.IUrlRouterProvider,
      $locationProvider: angular.ILocationProvider,
      $ionicConfigProvider: ionic.utility.IonicConfigProvider,
      $compileProvider: angular.ICompileProvider,
      $httpProvider: angular.IHttpProvider
    ) => {

      $httpProvider.defaults.withCredentials = true;

      $ionicConfigProvider.views.transition('none');

      $ionicConfigProvider.views.forwardCache(false);

      // $ionicConfigProvider.views.maxCache(3);

      $ionicConfigProvider.tabs.position('bottom');

      $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob|wxlocalresource):|data:image\//);
    }
  );
}
