'use strict';
export const ngConfig = angular.module('teambition').config([
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

    $ionicConfigProvider.views.transition('ios');

    $ionicConfigProvider.tabs.style('standard');

    $ionicConfigProvider.tabs.position('bottom');

    $ionicConfigProvider.navBar.alignTitle('center');

    $ionicConfigProvider.navBar.positionPrimaryButtons('left');

    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob|wxlocalresource):|data:image\//);
  }
]);
