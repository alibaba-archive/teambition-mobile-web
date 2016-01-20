'use strict';
export default angular.module('teambition').config([
  '$ionicConfigProvider',
  '$compileProvider',
  '$httpProvider',
  (
    $ionicConfigProvider: ionic.utility.IonicConfigProvider,
    $compileProvider: angular.ICompileProvider,
    $httpProvider: angular.IHttpProvider
  ) => {

    $httpProvider.defaults.withCredentials = true;

    $ionicConfigProvider.views.forwardCache(false);

    $ionicConfigProvider.views.maxCache(0);

    $ionicConfigProvider.tabs.position('bottom');

    $ionicConfigProvider.tabs.style('standard');

    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob|wxlocalresource):|data:image\//);
  }
]);
