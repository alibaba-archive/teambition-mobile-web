/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface ITaskDataParsed extends ITaskData {
    _projectId: string;
    oneDay: boolean;
    overDue: boolean;
    executorAvatar: string;
    executorName: string;
    parsedNote: string;
    stage: string;
    subtaskDone: number;
    subtaskTotal: number;
    tasklist: string;
    fetchTime?: number;
    linked?: ILinkedData[];
    isLike?: boolean;
    likedPeople?: string;
    likesCount: number;
    recurrenceTime: string;
    displayDuedate?: Date;
    detailInfos: IDetailInfos;
  }

  export interface ITaskParser {
    (task: ITaskData, taskInfos?: IDetailInfos): ITaskDataParsed;
  }

  angular.module('teambition').factory('taskParser',
  // @ngInject
  function(
    $sanitize: (html: string) => string,
    mdParser: IMdParser,
    Moment: moment.MomentStatic,
    Cache: angular.ICacheObject
  ) {
    return function <ITaskParser>(task: ITaskDataParsed) {
      let detailInfos = task.detailInfos ? task.detailInfos : {};
      let today = Date.now();
      let dueDate = new Date(task.dueDate).valueOf();
      if (dueDate < today) {
        if (Moment().isSame(task.dueDate, 'day')) {
          task.oneDay = true;
        }else {
          task.overDue = true;
        }
      }
      if (!task.executor) {
        task.executor = {
          name: '还没有设置执行者',
          avatarUrl: teambition.nobodyUrl,
          _id: ''
        };
      }
      task.displayDuedate = task.dueDate ? new Date(task.dueDate) : null;
      task.executorAvatar = task.executor.avatarUrl;
      task.executorName = task.executor.name;
      task.parsedNote = task.note;
      task.parsedNote = mdParser(task.parsedNote);
      task.parsedNote = $sanitize(task.parsedNote);
      task.recurrenceTime = task.recurrence ? task.recurrence[0] : undefined;
      let stage = detailInfos.stage;
      let tasklist =  detailInfos.tasklist;
      task.stage = stage ? stage.name : undefined;
      task.tasklist = tasklist ? tasklist.title : undefined;
      return task;
    };
  });
}
