'use strict';
import BaseModel from '../bases/BaseModel';
import TaskModel from './TaskModel';
import {ISubtaskData, ITaskData} from 'teambition';

class SubtaskModel extends BaseModel {

  public getOne(subtaskId: string) {
    return this._get<ISubtaskData>('subtask:detail', subtaskId);
  }

  public setOne(subtask: ISubtaskData) {
    const cache = this.getOne(subtask._id);
    if (cache) {
      this.updateSubtask(subtask._id, subtask);
    }else {
      this._set('subtask:detail', subtask._id, subtask);
    }
  }

  public transform(subtaskId: string, task: ITaskData) {
    this.deleteOne(subtaskId);
    TaskModel.addTask(task);
  }

  public deleteOne(subtaskId: string) {
    const subtask = this.getOne(subtaskId);
    const subtasks = this.getFromTask(subtask._taskId);
    const tasksIndex = this._get<string[]>(`task:subtask:index`, subtask._taskId);
    if (tasksIndex) {
      const position = tasksIndex.indexOf(subtask._id);
      subtasks.splice(position, 1);
      tasksIndex.splice(position, 1);
    }
  }

  public getFromTask(taskId: string) {
    return this._get<ISubtaskData[]>('task:subtask', taskId);
  }

  public setFromTask(taskId: string, content: ISubtaskData[]) {
    let cache = this.getFromTask(taskId);
    if (!cache) {
      let taskSubtasksIndex = [];
      angular.forEach(content, (subtask: ISubtaskData) => {
        this._set(`subtask:detail`, subtask._id, subtask);
        taskSubtasksIndex.push(subtask._id);
      });
      this._set('task:subtask:index', taskId, taskSubtasksIndex);
      this._set('task:subtask', taskId, content);
    }
  }

  public setSubtask(subtask: ISubtaskData) {
    let index = this._get<string[]>('task:subtask:index', subtask._taskId);
    if (index && index.indexOf(subtask._id) === -1) {
      let subtasks = this.getFromTask(subtask._taskId);
      subtasks.push(subtask);
      index.push(subtask._id);
    }
    this._set('subtask:detail', subtask._id, subtask);
  }

  public updateSubtask(subtaskId: string, patch: any) {
    this._updateObj('subtask:detail', subtaskId, patch);
  }
}

export default new SubtaskModel();
