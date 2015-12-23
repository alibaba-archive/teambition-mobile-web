'use strict';
import {nobodyUrl} from '../../config/config';
import {getDeps} from '../../bases/Utils';
import {mdParser} from './mdParser';
import {ITaskData} from 'teambition';

export const taskParser = (task: ITaskData) => {
  let detailInfos = task.detailInfos ? task.detailInfos : {};
  let today = Date.now();
  let dueDate = new Date(task.dueDate).valueOf();
  if (dueDate < today) {
    if (moment().isSame(task.dueDate, 'day')) {
      task.oneDay = true;
    }else {
      task.overDue = true;
    }
  }
  if (!task.executor) {
    task.executor = {
      name: '还没有设置执行者',
      avatarUrl: nobodyUrl,
      _id: ''
    };
  }
  task.displayDuedate = task.dueDate ? new Date(task.dueDate) : null;
  task.executorAvatar = task.executor.avatarUrl;
  task.executorName = task.executor.name;
  task.parsedNote = task.note;
  task.parsedNote = mdParser(task.parsedNote);
  let $sanitize = getDeps('$sanitize');
  task.parsedNote = $sanitize(task.parsedNote);
  task.recurrenceTime = task.recurrence ? task.recurrence[0] : undefined;
  let stage = detailInfos.stage;
  let tasklist =  detailInfos.tasklist;
  task.stage = stage ? stage.name : undefined;
  task.tasklist = tasklist ? tasklist.title : undefined;
  return task;
};
