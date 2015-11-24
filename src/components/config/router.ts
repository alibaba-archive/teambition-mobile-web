/// <reference path='../interface/teambition.d.ts' />
module teambition {
  'use strict';
  angular.module('teambition').config([
    '$stateProvider',
    (
      $stateProvider: angular.ui.IStateProvider
    ) => {
      $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'login/index.html'
      })
      .state('projects', {
        url: '/projects',
        templateUrl: 'project/index.html'
      })
      .state('create_project', {
        url: '/projects/create',
        templateUrl: 'create/project/index.html'
      })
      .state('subscribe', {
        url: '/qrcode?subscribe',
        templateUrl: 'qrcode/index.html'
      })
      .state('qrcode', {
        url: '/qrcode/:projectId/:signCode/:invitorId',
        templateUrl: 'qrcode/index.html'
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
      .state('create_task', {
        url: '/project/:_id/task/create',
        templateUrl: 'create/task/index.html'
      })
      .state('create_event', {
        url: '/project/:_id/event/create',
        templateUrl: 'create/event/index.html'
      })
      .state('create_post', {
        url: '/project/:_id/post/create',
        templateUrl: 'create/post/index.html'
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
          object: {
            templateUrl: ($stateParams: any) => {
              return `detail/${$stateParams.type}/index.html`;
            }
          },
          'detail-activities': {
            templateUrl: 'detail/activities/index.html'
          }
        }
      })
      .state('edit_position', {
        url: '/detail/:type/:_id/position',
        templateUrl: 'edit/position/index.html'
      })
      .state('choose_project', {
        url: '/detail/:type/:_id/position/projects',
        templateUrl: 'edit/projects/index.html'
      })
      .state('choose_tasklist', {
        url: '/detail/:type/:_id/position/tasklist',
        templateUrl: 'edit/tasklist/index.html'
      })
      .state('choose_stage', {
        url: '/detail/:type/:_id/position/stage',
        templateUrl: 'edit/stage/index.html'
      })
      .state('edit_executor', {
        url: '/detail/task/:_id/executor',
        templateUrl: 'detail/task/executor/index.html'
      })
      .state('edit_detail_note', {
        url: '/detail/:type/:_id/note',
        templateUrl: 'detail/task/note/index.html'
      })
      .state('edit_detail_content', {
        url: '/detail/:type/:_id/content',
        templateUrl: 'edit/content/index.html'
      })
      .state('subtask', {
        url: '/detail/task/:_id/subtasks',
        templateUrl: 'detail/task/subtask/index.html'
      })
      .state('create_subtask', {
        url: '/detail/task/:_id/subtasks/create',
        templateUrl: 'detail/task/subtask/create/index.html'
      })
      .state('edit_task_priority', {
        url: '/detail/task/:_id/priority',
        templateUrl: 'detail/task/priority/index.html'
      })
      .state('edit_task_duedate', {
        url: '/detail/task/:_id/duedate',
        templateUrl: 'detail/task/dueDate/index.html'
      })
      .state('edit_detail_recurrence', {
        url: '/detail/:type/:_id/recurrence',
        templateUrl: 'detail/task/recurrence/index.html'
      })
      .state('edit_involve', {
        url: '/detail/:type/:_id/involve',
        templateUrl: 'detail/involve/index.html',
        controller: 'EditInvolveView',
        controllerAs: 'EditInvolveCtrl'
      })
      .state('link', {
        url: '/detail/:type/:_id/link',
        templateUrl: 'detail/linked/index.html'
      });
    }
  ]);
}
