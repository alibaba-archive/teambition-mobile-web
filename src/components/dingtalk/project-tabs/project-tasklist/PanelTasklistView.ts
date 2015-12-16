'use strict';
import {nobodyUrl} from '../../../config/config';
import {parentView, inject} from '../../../bases/Utils';
import {View} from '../../../bases/View';
import {Ding} from '../../../../Run';
import {TaskFilter} from '../../../et/ETs';
import {TasklistAPI, ProjectDetailAPI, StageAPI, MemberAPI} from '../../../services/service';
import {IStageData, ITasklistData, ITaskData, IMemberData} from 'teambition';

let projectId: string;
let smartTitleMap = {
  'notAssigned': '待认领任务',
  'notDone': '未完成任务',
  'done': '已完成任务'
};
let filter: TaskFilter;

let stages: IStageData[];
let tasklistSelected: ITasklistData;

@parentView('TabsView')
@inject([
  'StageAPI',
  'MemberAPI',
  'TasklistAPI',
  'ProjectDetailAPI',
  'taskFilter'
])
export class PanelTasklistView extends View {

  public ViewName = 'PanelTasklistView';

  public stages: IStageData[];
  public tasklists: ITasklistData[];
  public tasklistSelected: ITasklistData;
  protected taskFilter: TaskFilter;

  public tasks: {
    [index: string]: ITaskData[];
  };

  public taskLength: number;

  private TasklistAPI: TasklistAPI;
  private StageAPI: StageAPI;
  private ProjectDetailAPI: ProjectDetailAPI;
  private MemberAPI: MemberAPI;

  private members: {
    [index: string]: IMemberData;
  };

  constructor() {
    super();
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

  public chooseTasklist(e: Event, id: string) {
    if (id) {
      angular.forEach(this.tasklists, (tasklist: ITasklistData) => {
        if (tasklist._id === id) {
          tasklistSelected = this.tasklistSelected = tasklist;
        }
      });
      this.fetchTasksByTasklistId(id);
    }
    filter.close(e);
  }

  public chooseSmartlist(e: Event, type: string) {
    let dummySelected = <ITasklistData>{};
    dummySelected._id = type;
    dummySelected.title = smartTitleMap[type];
    dummySelected._projectId = projectId;
    tasklistSelected = this.tasklistSelected = dummySelected;
    this.fetchTasksBySmartGroup(type);
    filter.close(e);
  }

  public openTaskDetail(_id: string) {
    if (_id) {
      window.location.hash = `/detail/task/${_id}`;
    }
  }

  public openTaskFilter() {
    filter = this.taskFilter.show(this);
  }

  public closeTaskFilter(e?: Event) {
    filter.close(e);
  }

  public getAvatar(task: ITaskData) {
    let avatarUrl = (task.executorAvatar === nobodyUrl) ?
                    this.members[task._executorId].avatarUrl :
                    task.executorAvatar;
    return avatarUrl;
  }

  private initFetch() {
    return this.$q.all([
      this.getTaskLists()
      .then(() => {
        let promise = this.fetchTasksBySmartGroup(this.tasklistSelected._id);
        if (!promise) {
          promise = this.fetchTasksByTasklistId(this.tasklistSelected._id);
        }
        return promise;
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

  private fetchTasksBySmartGroup(type: string) {
    let promise: angular.IPromise<ITaskData[]>;
    switch (type) {
      case 'done':
        promise = this.ProjectDetailAPI.getTasksDone(projectId);
        break;
      case 'notDone':
        promise = this.ProjectDetailAPI.getTasksNotDone(projectId);
        break;
      case 'notAssigned':
        promise = this.ProjectDetailAPI.fetchNoExecutorOrDuedateTasks(projectId, 'noneExecutor');
        break;
    }
    if (promise) {
      return promise.then((tasks: ITaskData[]) => {
        stages = this.stages = [{
          _id: type,
          name: smartTitleMap[type],
          _creatorId: '',
          _projectId: projectId,
          _tasklistId: type,
          isArchived: null,
          totalCount: tasks.length,
          order: 0
        }];
        this.tasks = {};
        this.tasks[type] = tasks;
        this.taskLength = tasks.length;
      })
      .catch((reason: any) => {
        let message = this.getFailureReason(reason);
        this.showMsg('error', '获取数据时出错', message);
      });
    }
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
