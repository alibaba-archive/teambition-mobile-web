'use strict';
import {getDeps} from '../../bases/Utils';
import {mdParser, mapfile, emojiParser} from '../service';
import {IActivityData} from 'teambition';

export const activityParser = function(activity: IActivityData) {
  activity.isComment = (activity.rawAction === 'comment');
  activity.icon = mapfile(activity.rawAction);
  activity.icon = (activity.action !== 'set_done') ? activity.icon : 'icon-checkbox-checked';
  if (activity.isComment) {
    if (activity.content.attachments && !activity.content.comment) {
      activity.comment = '上传了附件';
    }
    activity.comment = activity.content.comment.length ? activity.content.comment : activity.title;
    activity.comment = emojiParser.replaceMd(activity.comment);
    activity.comment = mdParser(activity.comment);
    let $sanitize = getDeps('$sanitize');
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
