'use strict';
export default angular.module('teambition').config([
  '$stateProvider',
  '$urlRouterProvider',
  (
    $stateProvider: angular.ui.IStateProvider,
    $urlRouterProvider: angular.ui.IUrlRouterProvider
  ) => {
    $stateProvider
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
    .state('project.collections', {
      url: '/collections?visible',
      views: {
        'project-collections': {
          templateUrl: 'project-tabs/project-collections/index.html'
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
      url: '/project/:_id/collections/:_collectionId',
      templateUrl: 'project-tabs/project-collections/index.html'
    })
    .state('detail', {
      url: '/detail',
      templateUrl: 'detail/index.html'
    })
    .state('detail403', {
      url: '/detail403?projectId&projectName&inviterId&inviterName&signCode&nextUrl',
      templateUrl: 'detail/403/index.html'
    })
    .state('detail.views', {
      url: '/:type/:_id?linkedId&projectId&projectName&inviterId&inviterName&signCode',
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
    .state('projectcontainer', {
      url: '/project',
      templateUrl : 'detail/index.html',
    })
    .state('projectcontainer.detail', {
      url: '/:projectId/:type/:_id?linkedId',
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

    $urlRouterProvider.otherwise('projects');
  }
]);
