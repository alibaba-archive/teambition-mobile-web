'use strict';
export default angular.module('teambition').config([
  '$stateProvider',
  (
    $stateProvider: angular.ui.IStateProvider
  ) => {
    $stateProvider
    .state('login', {
      url: '/login',
      templateUrl: 'login/index.html'
    })
    .state('wx_login', {
      url: '/wx_login',
      templateUrl: 'login/index.html'
    })
    .state('projects', {
      url: '/projects',
      templateUrl: 'project/index.html'
    })
    .state('project', {
      url: '/project/:_id',
      templateUrl: 'project-tabs/index.html'
    })
    .state('project.home', {
      url: '/home?visible',
      views: {
        'project-home': {
          templateUrl: 'project-tabs/project-home/index.html'
        }
      }
    })
    .state('project.tasklist', {
      url: '/tasklist?visible',
      views: {
        'project-task': {
          templateUrl: 'project-tabs/project-tasklist/index.html'
        }
      }
    })
    .state('project.post', {
      url: '/post?visible',
      views: {
        'project-post': {
          templateUrl: 'project-tabs/project-post/index.html'
        }
      }
    })
    .state('project.work', {
      url: '/work?visible',
      views: {
        'project-work': {
          templateUrl: 'project-tabs/project-work/index.html'
        }
      }
    })
    .state('project.event', {
      url: '/event?visible',
      views: {
        'project-event': {
          templateUrl: 'project-tabs/project-event/index.html'
        }
      }
    })
    .state('collections', {
      url: '/project/:_id/work/:_collectionId',
      templateUrl: 'project-tabs/project-work/index.html'
    })
    .state('detail', {
      url: '/detail',
      templateUrl: 'detail/index.html'
    })
    .state('detail.views', {
      url: '/:type/:_id?linkedId',
      views: {
        'object': {
          templateUrl: ($stateParams: any) => {
            return `detail/${$stateParams.type}/index.html`;
          }
        },
        'detail-activities': {
          templateUrl: 'detail/activities/index.html'
        }
      }
    })
    .state('detail.conjunction', {
      url: '/:type/conjunction/:_id?linkedId',
      views: {
        'object': {
          templateUrl: ($stateParams: any) => {
            return `detail/${$stateParams.type}/index.html`;
          }
        },
        'detail-activities': {
          templateUrl: 'detail/activities/index.html'
        }
      }
    })
    .state('subtask', {
      url: '/detail/task/:_id/subtasks',
      templateUrl: 'detail/task/subtask/index.html'
    })
    .state('link', {
      url: '/detail/:type/:_id/link',
      templateUrl: 'detail/linked/index.html'
    })
    .state('invited', {
      url: '/invited/:projectId/:signCode/:inviterId',
      controller: 'InvitedView as InvitedCtrl'
    });
  }
]);
