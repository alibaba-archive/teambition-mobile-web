'use strict';
export default angular.module('teambition').config([
  '$stateProvider',
  (
    $stateProvider: angular.ui.IStateProvider
  ) => {
    $stateProvider
    .state('tasklist', {
      url: '/project/:_id/tasklist',
      views: {
        main: {
          templateUrl: 'tasklist/index.html'
        }
      }
    })
    .state('create_task', {
      url: '/project/:_id/task/create',
      views: {
        main: {
          templateUrl: 'create/task/index.html'
        }
      }
    })
    .state('detail', {
      url: '/detail',
      views: {
        main: {
          templateUrl: 'detail/index.html'
        }
      }
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
    .state('detail_comment', {
      url: '/projects/:projectId/detail/:type/:_id/comment',
      views: {
        main: {
          templateUrl: 'detail/comment/index.html'
        }
      }
    })
    .state('edit_executor', {
      url: '/detail/task/:_id/executor',
      views: {
        main: {
          templateUrl: 'detail/task/executor/index.html'
        }
      }
    })
    .state('edit_note', {
      url: '/detail/task/:_id/note',
      views: {
        main: {
          templateUrl: 'detail/task/note/index.html'
        }
      }
    })
    .state('edit_detail_content', {
      url: '/detail/:type/:_id/content',
      views: {
        main: {
          templateUrl: 'edit/content/index.html'
        }
      }
    })
    .state('subtask', {
      url: '/detail/task/:_id/subtasks',
      views: {
        main: {
          templateUrl: 'detail/task/subtask/index.html'
        }
      }
    })
    .state('subtask_detail', {
      url: '/detail/task/:_id/subtasks/:subtaskId/detail',
      views: {
        main: {
          templateUrl: 'detail/task/subtask/detail/index.html'
        }
      }
    })
    .state('create_subtask', {
      url: '/detail/task/:_id/subtasks/create',
      views: {
        main: {
          templateUrl: 'detail/task/subtask/create/index.html'
        }
      }
    })
    .state('edit_task_priority', {
      url: '/detail/task/:_id/priority',
      views: {
        main: {
          templateUrl: 'detail/task/priority/index.html'
        }
      }
    })
    .state('edit_task_duedate', {
      url: '/detail/task/:_id/duedate',
      views: {
        main: {
          templateUrl: 'detail/task/dueDate/index.html'
        }
      }
    })
    .state('edit_detail_recurrence', {
      url: '/detail/:type/:_id/recurrence',
      views: {
        main: {
          templateUrl: 'detail/task/recurrence/index.html'
        }
      }
    })
    .state('edit_involve', {
      url: '/detail/:type/:_id/involve',
      views: {
        main: {
          templateUrl: 'detail/involve/index.html',
          controller: 'EditInvolveView',
          controllerAs: 'EditInvolveCtrl'
        }
      }
    });
  }
]);
