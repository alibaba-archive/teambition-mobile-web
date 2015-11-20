/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';
  export interface ITaskData {
    _id: string;
    _executorId: string;
    _projectId: string;
    _tasklistId: string;
    tagsId: string[];
    _stageId: string;
    involveMembers: string[];
    updated: string;
    created: string;
    isDone: boolean;
    priority: number;
    dueDate: string;
    note: string;
    content: string;
    likesCount: number;
    recurrence: string[] | string;
    subtaskCount: {
      total: number;
      done: number;
    };
    executor: {
      name: string;
      avatarUrl: string;
      _id: string;
    };
    linked?: ILinkedData[];
    [index: string]: any;
  }

  export interface IFileData {
    _id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    fileKey: string;
    fileCategory: string;
    imageWidth: number;
    imageHeight: number;
    _parentId: string;
    _projectId: string;
    _creatorId: string;
    creator: IMemberData;
    tagIds: string[];
    visiable: string;
    downloadUrl: string;
    thumbnail: string;
    thumbnailUrl: string;
    description: string;
    source: string;
    folder: string;
    involveMembers: string[];
    created: string;
    updated: string | number;
    lastVersionTime: string;
    isArchived: boolean;
    previewUrl: string;
    linked?: ILinkedData[];
    [index: string]: any;
  }

  export interface ICollectionData {
    _id: string;
    _parentId: string;
    collectionType: string;
    _creatorId: string;
    _projectId: string;
    description: string;
    title: string;
    updated: string;
    created: string;
    isArchived: boolean;
    workCount: number;
    collectionCount: number;
    color: string;
    [index: string]: any;
  }

  export interface IPostData {
    _id: string;
    postMode: string;
    _projectId: string;
    involveMembers: string[];
    updated: string | number;
    attachments: IFileData[];
    content: string;
    html: string;
    creator: IMemberData;
    title: string;
    linked?: ILinkedData[];
    [index: string]: any;
  }

  export interface IEventData {
    _id: string;
    endDate: any;
    startDate: any;
    _projectId: string;
    location: string;
    content: string;
    title: string;
    recurrence: string;
    updated: string;
    involveMembers: string[];
    linked?: ILinkedData[];
    [index: string]: any;
  }

  export interface ILikeData {
    isLike: boolean;
    likesCount: number;
    likesGroup: IMemberData[];
  }

  export interface IDetailInfos {
    like?: ILikeData;
    tags?: ITagsData[];
    tasklist?: ITasklistData;
    stage?: IStageData;
    members?: {[index: string]: IMemberData};
  }

  export interface IDetailAPI {
    fetch(_id: string, type: string, linkedId?: string): angular.IPromise<any>;
    update(_id: string, type: string, patch: any, param?: string): angular.IPromise<any>;
    create(type: string, content: any): angular.IPromise<any>;
  }

  @inject([
    'DetailModel',
    'ObjectLinkAPI',
    'LikeAPI',
    'TagsAPI',
    'MemberAPI',
    'TasklistAPI'
  ])
  class DetailAPI extends BaseAPI implements IDetailAPI {
    private DetailModel: IDetailModel;
    private ObjectLinkAPI: IObjectLinkAPI;
    private LikeAPI: ILikeAPI;
    private TagsAPI: ITagsAPI;
    private MemberAPI: IMemberAPI;
    private TasklistAPI: ITasklistAPI;

    private filedsMap = {
      task: this.queryFileds.taskFileds,
      post: this.queryFileds.postFileds,
      event: this.queryFileds.eventFileds,
      work: this.queryFileds.workFileds
    };

    public fetch (_id: string, type: string, linkedId: string) {
      return this.query(_id, type, linkedId)
      .then((data: any) => {
        let detailInfos: IDetailInfos;
        detailInfos = {};
        let fetchTasks = [
          this.ObjectLinkAPI.fetch(type, _id)
          .then((linked: ILinkedData[]) => {
            data.linked = linked;
          }),
          this.LikeAPI.getLiked(type, _id)
          .then((liked: ILikeData) => {
            detailInfos.like = liked;
          }),
          this.TagsAPI.fetchByObjectId(`${type}s`, _id)
          .then((tags: ITagsData[]) => {
            detailInfos.tags = tags;
          }),
          this.MemberAPI.fetch(data._projectId)
          .then((members: {[index: string]: IMemberData}) => {
            detailInfos.members = members;
          })
        ];
        if (type === 'task') {
          fetchTasks.push(
            this.TasklistAPI.fetch(data._tasklistId)
            .then((tasklist: ITasklistData) => {
              detailInfos.tasklist = tasklist;
              detailInfos.stage = this.findElementInArray(tasklist.hasStages, data._stageId);
            })
          );
        }
        return this.$q.all(fetchTasks)
        .then(() => {
          return this.detailParser(data, type, detailInfos);
        });
      });
    }

    public update(_id: string, type: string, patch: any, param?: string) {
      return this.RestAPI.update({
        Type: `${type}s`,
        Id: _id,
        Path1: param
      }, patch)
      .$promise
      .then((detail: any) => {
        this.DetailModel.updateDetail(`${type}:detail:${_id}`, detail);
      });
    }

    public create(type: string, content: any) {
      return this.RestAPI.save({
        Type: `${type}s`
      }, content)
      .$promise
      .then((detail: any) => {
        return this.DetailModel.setDetail(`${type}:detail:${detail._id}`, detail);
      });
    }

    private query(_id: string, type: string, linkedId: string) {
      let cache = this.DetailModel.getDetail(`${type}:detail:${_id}`);
      let deferred = this.$q.defer();
      if (cache) {
        deferred.resolve(cache);
        return deferred.promise;
      }else {
        return this.RestAPI.get({
          Type: `${type}s`,
          Id: _id,
          _objectLinkId: linkedId,
          fields: this.filedsMap[type]
        })
        .$promise
        .then((data: any) => {
          return data;
        });
      }
    }

    private detailParser (detail: any, type: string, detailInfos: IDetailInfos): any {
      detail.isLike = detailInfos.like.isLike;
      detail.likesGroup = detailInfos.like.likesGroup;
      detail.likesCount = detailInfos.like.likesCount;
      detail.detailInfos = detailInfos;
      return this.DetailModel.setDetail(`${type}:detail:${detail._id}`, detail);
    }

    private findElementInArray <T extends {_id: string}>(array: T[], id: string): T {
      for (let index = 0; index < array.length; index++) {
        let element = array[index];
        if (element._id === id) {
          return element;
        }
      }
    }
  }

  angular.module('teambition').service('DetailAPI', DetailAPI);
}
