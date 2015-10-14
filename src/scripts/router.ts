/// <reference path='interface/teambition.d.ts' />
module teambition {
  'use strict';
  angular.module('teambition').config([
    '$stateProvider',
    (
      $stateProvider: angular.ui.IStateProvider
    ) => {
      $stateProvider
      .state('wx_login', {
        url: '/wx_login',
        templateUrl: 'login/index.html'
      })
      .state('wechat', {
        url: '/wechat',
        templateUrl: 'project/index.html'
      })
      .state('subscribe', {
        url: '/qrcode?subscribe',
        templateUrl: 'qrcode/index.html'
      })
      .state('qrcode', {
        url: '/qrcode/:projectId/:signCode/:invitorId',
        templateUrl: 'qrcode/index.html'
      })
      .state('wproject', {
        url: '/project/:_id',
        templateUrl: 'project-tabs/index.html'
      })
      .state('wproject.home', {
        url: '/home?visible',
        views: {
          'project-home': {
            templateUrl: 'project-home/index.html'
          }
        }
      })
      .state('wproject.tasklist', {
        url: '/tasklist?visible',
        views: {
          'project-task': {
            templateUrl: 'project-tasklist/index.html'
          }
        }
      })
      .state('wproject.post', {
        url: '/post?visible',
        views: {
          'project-post': {
            templateUrl: 'project-post/index.html'
          }
        }
      })
      .state('wproject.work', {
        url: '/work?visible',
        views: {
          'project-work': {
            templateUrl: 'project-work/index.html'
          }
        }
      })
      .state('wproject.event', {
        url: '/event?visible',
        views: {
          'project-event': {
            templateUrl: 'project-event/index.html'
          }
        }
      })
      .state('collections', {
        url: '/project/:_id/work/:_collectionId',
        templateUrl: 'project-work/index.html'
      });
    }
  ]);
}
