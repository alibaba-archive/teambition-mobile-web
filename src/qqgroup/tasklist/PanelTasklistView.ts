'use strict';
import {
  parentView,
  inject,
  View,
  TasklistAPI,
  StageAPI,
  MemberAPI,
  getParam
} from '../index';
import {IStageData, ITasklistData, ITaskData, IMemberData} from 'teambition';

let projectId: string;

let stages: IStageData[];
let tasklistSelected: ITasklistData;

@parentView('TabsView')
@inject([
  'StageAPI',
  'MemberAPI',
  'TasklistAPI'
])
export class PanelTasklistView extends View {

  public static $inject = ['$scope'];

  public ViewName = 'PanelTasklistView';

  public stages: IStageData[];
  public tasklists: ITasklistData[];
  public tasklistSelected: ITasklistData;

  public tasks: {
    [index: string]: ITaskData[];
  };

  public taskLength: number;
  public showNotify = false;
  public showCompleted = false;

  private TasklistAPI: TasklistAPI;
  private StageAPI: StageAPI;
  private MemberAPI: MemberAPI;

  private members: {
    [index: string]: IMemberData;
  };

  private shareOptions: any;

  constructor(
    $scope: angular.IScope
  ) {
    super();
    this.$scope = $scope;
    $scope.$on('new:task', (event, ...args) => {
      this.showNotify = true;
      this.shareOptions = args[0][1];
    });
    this.zone.run(() => {
      this.stages = stages;
      this.tasklistSelected = tasklistSelected;
    });
  }

  public onInit() {
    projectId = this.$state.params._id;
    return this.initFetch()
    .catch((reason: any) => {
      let message = this.getFailureReason(reason);
      this.showMsg('error', '获取数据出错', message);
    });
  }

  public openTaskDetail(_id: string) {
    if (_id) {
      window.location.hash = `/detail/task/${_id}`;
    }
  }

  public getAvatar(task: ITaskData) {
    let avatarUrl = task._executorId ?
                    this.members[task._executorId].avatarUrl :
                    task.executorAvatar;
    return avatarUrl;
  }

  public openCreate() {
    if (!projectId) {
      return;
    }
    window.location.hash = `/project/${projectId}/task/create`;
  }

  public hideNotify() {
    this.showNotify = false;
  }

  public shareTask() {
    const search = window.location.search;
    const appid = getParam(search, 'appid');
    this.shareOptions['appid'] = appid;
    window['openGroup'].share(this.shareOptions);
  }

  public toogleCompleted() {
    this.showCompleted = !this.showCompleted;
  }

  public displayTask(stageId: string) {
    return !(stageId === this.stages[this.stages.length - 1]._id) || !this.showCompleted;
  }

  private initFetch() {
    return this.$q.all([
      this.getTaskLists()
      .then(() => {
        return this.fetchTasksByTasklistId(this.tasklistSelected._id);
      }),
      this.MemberAPI.fetch(projectId)
      .then((members: {[index: string]: IMemberData}) => {
        this.members = members;
      })
    ]);
  }

  private getTaskLists() {
    return this.TasklistAPI.fetchAll(projectId)
    .then((tasklists: ITasklistData[]) => {
      this.tasklists = tasklists;
      if (!this.tasklistSelected || this.tasklistSelected._projectId !== projectId) {
        this.tasklistSelected = tasklists[0];
      }
    });
  }

  private fetchTasksByTasklistId(_tasklistId: string) {
    this.tasks = {};
    this.taskLength = 0;
    this.showLoading();
    return this.StageAPI.fetch(_tasklistId)
    .then((data: IStageData[]) => {
      stages = this.stages = data;
      return this.TasklistAPI.fetchTasksByTasklistId(_tasklistId);
    })
    .then((tasks: ITaskData[]) => {
      angular.forEach(tasks, (task: ITaskData, index: number) => {
        this.taskLength += 1;
        if (!this.tasks[task._stageId]) {
          this.tasks[task._stageId] = [];
        }
        this.insertTask(task, this.tasks[task._stageId]);
      });
      this.hideLoading();
    });
  }

  private insertTask(task: ITaskData, tasks: ITaskData[]) {
    let taskTime = task.dueDate || task.updated || task.created;
    for (let index = 0; index < tasks.length; index ++) {
      let item = tasks[index];
      let itemTime = item.dueDate || item.updated || item.created;
      if ((taskTime >= itemTime && task.isDone) || (taskTime <= itemTime) && !task.isDone) {
        tasks.splice(index, 0, task);
        return tasks;
      }
    }
    tasks.push(task);
    return tasks;
  }
}

angular.module('teambition').controller('PanelTasklistView', PanelTasklistView);
