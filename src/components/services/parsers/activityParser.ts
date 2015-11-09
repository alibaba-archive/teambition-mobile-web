/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface IActivityData {
    _id: string;
    action: string;
    rawAction: string;
    created: number;
    boundToObjectType: string;
    creator: IMemberData;
    title: string;
    content?: {
      comment?: string;
      attachments: IFileData[];
      mentionsArray: string[];
      mentions: IMemberData;
      attachmentsName: string;
      creator: string;
        linked?: {
        _id: string;
        _projectId: string;
        _objectId: string;
        objectType: string;
        title: string;
      };
    };
  }

  export interface IActivityDataParsed extends IActivityData {
    parsed: boolean;
    isComment: boolean;
    icon: string;
    creatorName: string;
    creatorAvatar: string;
    comment: string;
    linked: {
      _id?: string;
    };
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
      activity.isComment = (activity.rawAction === 'comment');
      activity.icon = mapfile(activity.rawAction);
      activity.icon = (activity.action !== 'set_done') ? activity.icon : 'icon-checkbox-checked';
      if (activity.isComment) {
        if (activity.content.attachments && !activity.content.comment) {
          activity.comment = '上传了附件';
        }
        activity.comment = emojiParser.replaceMd(activity.content.comment);
        activity.comment = mdParser(activity.comment);
        activity.comment = $sanitize(activity.comment);
      }else {
        activity.comment = activity.title;
      }
      if (activity.content.linked) {
        activity.comment = mdParser(activity.title);
      }
      activity.created = + new Date(activity.created);
      activity.creatorAvatar = activity.creator.avatarUrl;
      activity.creatorName = activity.creator.name;
      return activity;
    };
  });
}
