/// <reference path="../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface IMessageData {
    _id: string;
    _boundToObjectId: string;
    _userId: string;
    boundToObjectType: string;
    __v: number;
    isAted: boolean;
    isLater: boolean;
    unreadActivitiesCount: number;
    isRead: boolean;
    isArchived: boolean;
    updated: string;
    created: string;
    creator: {
      _id: string;
      avatarUrl: string;
      name: string;
      isStaff: boolean;
      isDefaultEmail: boolean;
      id: string;
    };
    _projectId: string;
    project: IProjectData;
    task: ITaskData | IEventData | IPostData | IEntryData | IFileData;
    subtitle: string;
    latestActivity: any;
  }

  export interface IMessageModel {
    saveOne(data: IMessageData): void;
  }

  @inject([
    'DetailModel',
    'ActivityModel'
  ])
  class MessageModel extends BaseModel implements IMessageModel {

    // private DetailModel: IDetailModel;
    // private ActivityModel: IActivityModel;

    public saveOne(data: IMessageData) {
      // if (data._boundToObjectId && data.boundToObjectType && data.latestActivity) {
      //   let cache = this.DetailModel.getDetail(`${data.boundToObjectType}:detail:${data._boundToObjectId}`);
      //   if (!cache) {
      //     this.DetailModel.setDetail(`${data.boundToObjectType}:detail:${data._boundToObjectId}`, data[data.boundToObjectType]);
      //   }else {
      //     this.ActivityModel.addActivity(data._boundToObjectId, data.latestActivity);
      //     this.DetailModel.updateDetail(`${data.boundToObjectType}:detail:${data._boundToObjectId}`, data[data.boundToObjectType]);
      //   }
      // }
    }
  }

  angular.module('teambition').service('MessageModel', MessageModel);
}
