'use strict';
export default angular.module('teambition').config([
  '$stateProvider',
  (
    $stateProvider: angular.ui.IStateProvider
  ) => {
    $stateProvider
    .state('tasklist', {
      url: '/project/:_id/tasklist',
      templateUrl: 'tasklist/index.html'
    })
    .state('create_task', {
      url: '/project/:_id/task/create',
      templateUrl: 'create/task/index.html'
    })
    .state('detail', {
      url: '/detail',
      templateUrl: 'detail/index.html'
    })
    .state('detail.views', {
      url: '/:type/:_id',
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
    .state('subtask_detail', {
      url: '/detail/task/:_id/subtasks/:subtaskId/detail',
      templateUrl: 'detail/task/subtask/detail/index.html'
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
    });
  }
]);
