/// <reference path="../../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  let projectId: string;
  let smartTitleMap = {
    'smart-not-assigned': '待认领任务',
    'smart-not-done': '未完成任务',
    'smart-done': '已完成任务'
  };

  @parentView('TabsView')
  @inject([
    'StageAPI',
    'TasklistAPI',
    'taskFilter',
    '$ionicBackdrop'
  ])
  export class PanelTasklistView extends View {

    public ViewName = 'PanelTasklistView';

    public stages: IStageData[];
    public tasklists: ITasklistData[];
    public tasklistSelected: ITasklistData;
    protected taskFilter: EtTemplate.TaskFilter;

    public tasks: {
      [index: string]: ITaskDataParsed[];
    };

    public taskLength: number;

    private TasklistAPI: ITasklistAPI;
    private StageAPI: IStageAPI;
    private $ionicBackdrop: ionic.backdrop.IonicBackdropService;

    constructor() {
      super();
      this.zone.run(noop);
    }

    public onInit() {
      projectId = this.$state.params._id;
      return this.initFetch();
    }

    public onAllChangesDone() {
      if (Ding) {
        Ding.setLeft('返回', true, true, () => {
          location.href = location.href.replace(window.location.hash, '') + '#/projects';
        });
        Ding.setRight('新建任务', true, false, () => {
          window.location.href = window.location.href.replace('tasklist', 'task/create');
        });
      }
    }

    public chooseTasklist(tasklist_id: string) {
      if (tasklist_id) {
        angular.forEach(this.tasklists, (tasklist: ITasklistData) => {
          if (tasklist._id === tasklist_id) {
            this.tasklistSelected = tasklist;
          }
        });
        this.fetchTasksByTasklistId(tasklist_id);
      }
    }

    public chooseSmartlist(smartlist_type: string) {
      let dummySelected = <ITasklistData>{};
      dummySelected._id = smartlist_type;
      dummySelected.title = smartTitleMap[smartlist_type];
      this.tasklistSelected = dummySelected;
      // this.fetchTasksBySmartGroup(type);
    }

    public openTaskDetail(_id: string) {
      if (_id) {
        window.location.hash = `/detail/task/${_id}`;
      }
    }

    public openTaskFilter() {
      this.taskFilter.show(this);
    }

    private initFetch() {
      let self = this;
      return self.getTaskLists()
      .then(() => {
        return self.fetchTasksByTasklistId(this.tasklistSelected._id);
      });
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
      .then((stages: IStageData[]) => {
        this.stages = stages;
        return this.TasklistAPI.fetchTasksByTasklistId(_tasklistId);
      })
      .then((tasks: ITaskDataParsed[]) => {
        angular.forEach(tasks, (task: ITaskDataParsed, index: number) => {
          this.taskLength += 1;
          if (!this.tasks[task._stageId]) {
            this.tasks[task._stageId] = [];
          }
          this.insertTask(task, this.tasks[task._stageId]);
        });
        this.hideLoading();
      });
    }

    private insertTask(task: ITaskDataParsed, tasks: ITaskDataParsed[]) {
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
}
