module teambition {
  'use strict';
  export interface IqueryFileds {
    activityFileds: string;
    taskFileds: string;
    postFileds: string;
    eventFileds: string;
    workFileds: string;
    entryFileds: string;
    projectFileds: string;
    projectActivityFileds: string;
    memberFileds: string;
  }
  var fields: IqueryFileds = {
    activityFileds: '_id,action,content,created,icon,action,title,creator,linked,attachments',

    taskFileds: '_executorId,_id,_projectId,_stageId,_tasklistId,content,dueDate,updated,created,note,' +
                'executor,likesCount,likedPeople,isDone,priority,recurrence,linked,isLike,likesGroup,' +
                'involveMembers,subtaskCount,tagIds',

    postFileds: '_id,_projectId,attachments,linked,involveMembers,html,postMode,title,updated,creator,content',

    eventFileds: '_id,_projectId,title,location,content,linked,involveMembers,startDate,endDate,updated',

    workFileds: '_id,_projectId,creator,updated,involveMembers,fileType,fileName,fileSize,' +
                'thumbnail,downloadUrl,linked,previewUrl,fileCategory',

    entryFileds: '_id,_projectId,_entryCategoryId,amount,content,note,date,status,involveMembers,tags,type,title',

    projectFileds:  '_id,_defaultCollectionId,_rootCollectionId,created,logo,name,isPublic,' +
                    'organization,py,signCode,isStar,canDelete,canQuit,canArchive',

    projectActivityFileds: '_id,creator,created,title,action,objectType,boundToObjectType,content',

    memberFileds: '_id,name,title,avatarUrl'
  };

  angular.module('teambition').service('queryFileds', [ () => {
    return fields;
  }]);
}
