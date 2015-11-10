/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';
  export interface ITaskData {
    _id: string;
    _executorId: string;
    _projectId: string;
    _taskListId: string;
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
    endDate: string;
    startDate: string;
    _projectId: string;
    location: string;
    content: string;
    title: string;
    updated: string;
    involveMembers: string[];
    linked?: ILinkedData[];
    [index: string]: any;
  }

  export interface IDetailInfos {
    like?: ILikeDataParsed;
    tags?: ITagsData[];
    tasklist?: ITasklistData;
    stage?: IStageData;
    members?: {[index: string]: IMemberData};
  }

  export interface IDetailAPI {
    fetch(_id: string, type: string, linkedId?: string): angular.IPromise<any>;
    update(_id: string, type: string, patch: any): angular.IPromise<any>;
  }

  @inject([
    'taskParser',
    'postParser',
    'eventParser',
    'fileParser',
    'DetailModel',
    'ObjectLinkAPI',
    'LikeAPI',
    'TagsAPI',
    'MemberAPI',
    'TasklistAPI'
  ])
  class DetailAPI extends BaseAPI implements IDetailAPI {
    private taskParser: ITaskParser;
    private eventParser: IEventParser;
    private fileParser: IFileParser;
    private postParser: IPostParser;
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
          .then((liked: ILikeDataParsed) => {
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

    public update(_id: string, type: string, patch: any) {
      return this.RestAPI.update({
        Type: `${type}s`,
        Id: _id
      }, patch)
      .$promise
      .then((detail: any) => {
        this.DetailModel.updateDetail(`${type}:detail:${_id}`, detail);
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
          this.DetailModel.setDetail(`${type}:detail:${_id}`, data);
          return data;
        });
      }
    }

    private detailParser (detail: any, type: string, detailInfos: IDetailInfos): any {
      let members = detailInfos.members;
      let involveMembers = [];
      detail.isLike = detailInfos.like.isLike;
      detail.likesGroup = detailInfos.like.likesGroup;
      detail.likedPeople = detailInfos.like.likedPeople;
      detail.likesCount = detailInfos.like.likesCount;
      if (members) {
        angular.forEach(members, (member: IMemberData, index: number) => {
          if (detail.involveMembers.indexOf(member._id) !== -1) {
            involveMembers.push(member);
          }
        });
        if (involveMembers.length) {
          detail.members = involveMembers;
        }else {
          detail.members = [{name: '暂无参与者', avatarUrl: nobodyUrl}];
        }
      }
      switch (type) {
        case 'task':
          return this.taskParser(detail, detailInfos);
        case 'post':
          return this.postParser(detail);
        case 'work':
          return this.fileParser(detail);
        case 'event':
          return this.eventParser(detail);
      }
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
