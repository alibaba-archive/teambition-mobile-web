/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface ITaskDataParsed extends ITaskData {
    _projectId: string;
    parsed: boolean;
    oneDay: boolean;
    overDue: boolean;
    executorAvatar: string;
    executorName: string;
    originNode: string;
    stage: string;
    subtaskDone: number;
    subtaskTotal: number;
    tasklist: string;
    fetchTime?: number;
    linked?: ILinkedData[];
    isLike?: boolean;
    likedPeople?: string;
    likesCount: number;
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
    return function <ITaskParser>(task: ITaskDataParsed, detailInfos?: IDetailInfos) {
      detailInfos = detailInfos ? detailInfos : {};
      if (!task.parsed) {
        let today = Date.now();
        let dueDate = new Date(task.dueDate).valueOf();
        if (dueDate < today) {
          if (Moment().isSame(task.dueDate, 'day')) {
            task.oneDay = true;
          }else {
            task.overDue = true;
          }
        }
        task.executor = task.executor ? task.executor : {
          name: '还没有设置执行者',
          avatarUrl: teambition.nobodyUrl,
          _id: ''
        };
        task.executorAvatar = task.executor.avatarUrl;
        task.executorName = task.executor.name;
        task.originNode = task.note;
        task.note = mdParser(task.note);
        task.note = $sanitize(task.note);
        task.recurrence = task.recurrence ? task.recurrence[0] : undefined;
        let stage = detailInfos.stage;
        let tasklist =  detailInfos.tasklist;
        task.stage = stage ? stage.name : undefined;
        task.tasklist = tasklist ? tasklist.title : undefined;
        task.parsed = true;
        return task;
      }else {
        return task;
      }
    };
  });
}
