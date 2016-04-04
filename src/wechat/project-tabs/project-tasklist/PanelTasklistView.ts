'use strict';
import {
  View,
  parentView,
  inject,
  TagsAPI,
  TasklistAPI,
  StageAPI
} from '../../index';
import {
  ITasklistData,
  ITagsData,
  ITaskData,
  IStageData
} from 'teambition';

let projectId: string;
let tasklistSelected: ITasklistData;

@parentView('TabsView')
@inject([
  'StageAPI',
  'TagsAPI',
  'TasklistAPI'
])
export class PanelTasklistView extends View {

  public tasklists: ITasklistData[];
  public tasklist: {
    title: string;
  };
  public tasklistMap: {
    [index: string]: string;
  };
  public tags: {[index: string]: ITagsData};
  public tasks: {
    [index: string]: ITaskData[];
  };
  public taskLength: number;
  public stages: IStageData[];

  private TagsAPI: TagsAPI;
  private TasklistAPI: TasklistAPI;
  private StageAPI: StageAPI;

  public onInit() {
    projectId = this.$state.params._id;
    return this.initFetch();
  }

  public chooseTasklist() {
    let map = this.tasklistMap;
    let tasklistTitle = this.tasklist.title;
    let _id = map[tasklistTitle];
    if (_id) {
      this.fetchTasksByTasklistId(_id);
    }
  }

  public openTaskDetail(_id: string) {
    if (_id) {
      window.location.hash = `/detail/task/${_id}`;
    }
  }

  private initFetch() {
    let self = this;
    return this.$q.all([
      self.getTaskLists(),
      self.getTags()
    ])
    .then(() => {
      return self.fetchTasksByTasklistId(tasklistSelected._id);
    });
  }

  private getTaskLists() {
    return this.TasklistAPI.fetchAll(projectId)
    .then((tasklists: ITasklistData[]) => {
      this.tasklists = tasklists;
      if (!tasklistSelected || tasklistSelected._projectId !== projectId) {
        tasklistSelected = tasklists[0];
      }
      this.tasklist = {
        title: tasklistSelected.title
      };
      this.tasklistMap = this.setTasklistMap(tasklists);
    });
  }

  private getTags() {
    return this.TagsAPI.fetchByProject(projectId)
    .then((tags: {[index: string]: ITagsData}) => {
      this.tags = tags;
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

  private setTasklistMap(tasklists: ITasklistData[]) {
    let map: {
      [index: string]: string;
    };
    map = {};
    angular.forEach(tasklists, (tasklist: ITasklistData, index: number) => {
      map[tasklist.title] = tasklist._id;
    });
    return map;
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
