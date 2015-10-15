/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface IActivityData {
    _id: string;
    attachments: IFileData[];
    action: string;
    created: number;
    boundToObjectType: string;
    creator: IMemberData;
    title: string;
    content?: string | {
      objects: ITaskData[] | IFileData[] | IPostData[] | IEventData[];
      objectType: string;
      creator: string;
    };
    linked?: {
      _id: string;
      _projectId: string;
      _objectId: string;
      objectType: string;
      title: string;
    };
  }

  export interface IActivityDataParsed extends IActivityData {
    parsed: boolean;
    isComment: boolean;
    icon: string;
    creatorName: string;
    creatorAvatar: string;
  }

  export type IActivityParser = (activity: IActivityData) => IActivityDataParsed;

  angular.module('teambition').factory('activityParser',
  // @ngInject
  (
    $sanitize: any,
    mdParser: (markdown: any) => string,
    emojiParser: IEmojiParser,
    mapfile: (type: string) => string
  ) => {
    return (activity: IActivityDataParsed) => {
      if (activity.parsed) {
        return activity;
      }else {
        activity.isComment = (activity.action === 'comment');
        activity.icon = mapfile(activity.action);
        activity.icon = (activity.action !== 'set_done') ? activity.icon : 'icon-checkbox-checked';
        if (activity.isComment) {
          if (activity.attachments && !activity.content) {
            activity.content = '上传了附件';
          }
          activity.content = emojiParser.replaceMd(activity.content);
          activity.content = mdParser(activity.content);
          activity.content = $sanitize(activity.content);
        }else {
          activity.content = activity.title;
        }
        if (activity.linked) {
          let regExp = /data-id='([\s\S]*)'/;
          activity.linked._id = activity.title.match(regExp)[1];
          activity.content = mdParser(activity.content);
        }
        activity.created = + new Date(activity.created);
        activity.creatorAvatar = activity.creator.avatarUrl;
        activity.creatorName = activity.creator.name;
        activity.parsed = true;
        return activity;
      }
    };
  });
}
