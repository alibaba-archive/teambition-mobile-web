'use strict';
import BaseModel from '../bases/BaseModel';
import {taskParser} from '../services/service';
import {ITaskData} from 'teambition';

const TaskCollections = [
  'tasks:noneExecutor',
  'tasks:due',
  'tasks:tasklist',
  'tasks:done',
  'tasks:not:done'
];

class TaskModel extends BaseModel {

  public setNoneExecutorCollection(projectId: string, content: ITaskData[]) {
    let cache = this._get<ITaskData[]>('tasks:noneExecutor', projectId);
    if (!cache) {
      let results = [];
      let $index: string[] = [];
      angular.forEach(content, (task: ITaskData, index: number) => {
        let taskCache = this._get('task:detail', task._id);
        let result = taskParser(task);
        if (!taskCache) {
          results.push(result);
          this._set('task:detail', result._id, result);
        }else {
          this._updateObj('task:detail', result._id, result);
          results.push(taskCache);
        }
        $index.push(task._id);
      });
      this._set('tasks:noneExecutor:index', projectId, $index);
      this._set('tasks:noneExecutor', projectId, results);
      return results;
    }
    return cache;
  }

  public getNoneExecutorCollection(projectId: string) {
    let cache = this._get<ITaskData[]>('tasks:noneExecutor', projectId);
    return cache;
  }

  public setDueCollection(projectId: string, content: ITaskData[]) {
    let cache = this._get<ITaskData[]>('tasks:due', projectId);
    if (!cache) {
      let results: ITaskData[] = [];
      let $index: string[] = [];
      angular.forEach(content, (task: ITaskData, index: number) => {
        let taskCache = this._get<ITaskData>('task:detail', task._id);
        let result = taskParser(task);
        if (!taskCache) {
          this._set('task:detail', result._id, result);
          results.push(result);
        }else {
          results.push(taskCache);
        }
        $index.push(task._id);
      });
      this._set('tasks:due:index', projectId, $index);
      this._set('tasks:due', projectId, results);
      return results;
    }
    return cache;
  }

  public getDueCollection(projectId: string) {
    let cache = this._get<ITaskData[]>('tasks:due', projectId);
    return cache;
  }

  public setTasklistCollection(tasklistId: string, collection: ITaskData[]) {
    let cache = this.getTasklistCollection(tasklistId);
    if (!cache) {
      let results: ITaskData[] = [];
      let $index: string[] = [];
      if (collection.length) {
        angular.forEach(collection, (task: ITaskData, index: number) => {
          let cache = this._get<ITaskData>('task:detail', task._id);
          let result = taskParser(task);
          if (!cache) {
            this._set(`task:detail`, task._id, task);
            results.push(result);
          }else {
            this._updateObj('task:detail', result._id, result);
            results.push(cache);
          }
          $index.push(task._id);
        });
      }
      this._set('tasks:tasklist:index', tasklistId, $index);
      this._set('tasks:tasklist', tasklistId, results);
      return results;
    }else {
      angular.forEach(collection, (task: ITaskData, index: number) => {
        let $index = this._get<string[]>('tasks:tasklist:index', tasklistId);
        if ($index.indexOf(task._id) === -1) {
          let taskCache = this._get<ITaskData>('task:detail', task._id);
          let result = taskParser(task);
          if (!taskCache) {
            this._set('task:detail', result._id, result);
            cache.push(result);
          }else {
            this._updateObj('task:detail', result._id, result);
            cache.push(taskCache);
          }
          $index.push(task._id);
        }
      });
      return cache;
    }
  }

  public getTasklistCollection(tasklistId: string) {
    return this._get<ITaskData[]>('tasks:tasklist', tasklistId);
  }

  public setTasksDoneCollection(projectId: string, tasks: ITaskData[]) {
    let cache = this.getTasksDoneCollection(projectId);
    if (!cache) {
      let results: ITaskData[] = [];
      let $index: string[] = [];
      angular.forEach(tasks, (task: ITaskData, index: number) => {
        let taskCache = this._get<ITaskData>('task:detail', task._id);
        let result = taskParser(task);
        if (taskCache) {
          results.push(taskCache);
        }else {
          results.push(result);
          this._set('task:detail', result._id, result);
        }
        $index.push(task._id);
      });
      this._set('tasks:done:index', projectId, $index);
      this._set('tasks:done', projectId, results);
      return results;
    }else {
      return cache;
    }
  }

  public getTasksDoneCollection(projectId: string) {
    return this._get<ITaskData[]>('tasks:done', projectId);
  }

  public setTasksNotDoneCollection(projectId: string, tasks: ITaskData[]) {
    let cache = this.getTasksNotDoneCollection(projectId);
    if (!cache) {
      let results: ITaskData[] = [];
      let $index: string[] = [];
      angular.forEach(tasks, (task: ITaskData, index: number) => {
        let taskCache = this._get<ITaskData>('task:detail', task._id);
        let result = taskParser(task);
        if (taskCache) {
          results.push(taskCache);
        }else {
          results.push(result);
          this._set('task:detail', result._id, result);
        }
        $index.push(task._id);
      });
      this._set('tasks:not:done:index', projectId, $index);
      this._set('tasks:not:done', projectId, results);
      return results;
    }else {
      return cache;
    }
  }

  public getTasksNotDoneCollection(projectId: string) {
    return this._get<ITaskData[]>('tasks:not:done', projectId);
  }

  public addTask(task: ITaskData) {
    if (task._executorId === null) {
      this.addToNoneExecutorCollection(task);
    }
    if (new Date(task.dueDate).valueOf() <= Date.now() && !task.isDone) {
      this.addToDueCollection(task);
    }
    if (task.isDone) {
      this.addToDoneCollection(task);
    }
    if (!task.isDone) {
      this.addToNotDoneCollection(task);
    }
    this.addToTasklistCollection(task);
  }

  public removeTask(projectId: string, id: string) {
    angular.forEach(TaskCollections, (val: string) => {
      let $index = this._get<string[]>(`${val}:index`, projectId);
      if ($index) {
        let position = $index.indexOf(id);
        if (position !== -1) {
          let cache = this._get<ITaskData[]>(val, projectId);
          $index.splice(position, 1);
          cache.splice(position, 1);
        }
      }
    });
    this._delete('task:detail', id);
  }

  private addToDueCollection(task: ITaskData) {
    let $index = this._get<string[]>('tasks:due:index', task._tasklistId);
    if ($index && $index.indexOf(task._id) === -1) {
      let cache = this.getDueCollection(task._tasklistId);
      $index.push(task._id);
      cache.push(task);
    }
  }

  private addToNoneExecutorCollection(task: ITaskData) {
    let $index = this._get<string[]>('tasks:noneExecutor:index', task._tasklistId);
    if ($index && $index.indexOf(task._id) === -1) {
      let cache = this.getNoneExecutorCollection(task._tasklistId);
      $index.push(task._id);
      cache.push(task);
    }
  }

  private addToTasklistCollection(task: ITaskData) {
    let $index = this._get<string[]>('tasks:tasklist:index', task._tasklistId);
    if ($index && $index.indexOf(task._id) === -1) {
      let cache = this.getTasklistCollection(task._tasklistId);
      $index.push(task._id);
      cache.push(task);
    }
  }

  private addToDoneCollection(task: ITaskData) {
    let $index = this._get<string[]>('tasks:done:index', task._projectId);
    if ($index && $index.indexOf(task._id) === -1) {
      let cache = this.getTasksDoneCollection(task._projectId);
      $index.push(task._id);
      cache.push(task);
    }
  }

  private addToNotDoneCollection(task: ITaskData) {
    let $index = this._get<string[]>('tasks:not:done:index', task._projectId);
    if ($index && $index.indexOf(task._id) === -1) {
      let cache = this.getTasksNotDoneCollection(task._projectId);
      $index.push(task._id);
      cache.push(task);
    }
  }
}

export default new TaskModel();
