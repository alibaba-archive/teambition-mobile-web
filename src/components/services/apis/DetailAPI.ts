'use strict';
import {inject} from '../../bases/Utils';
import BaseAPI from '../../bases/BaseAPI';
import {
  ObjectLinkAPI,
  LikeAPI,
  TagsAPI,
  MemberAPI,
  TasklistAPI
} from '..';
import DetailModel from '../../models/DetailModel';
import {
  IDetailInfos,
  ILinkedData,
  ITagsData,
  ILikeData,
  IMemberData,
  ITasklistData
} from 'teambition';

@inject([
  'ObjectLinkAPI',
  'LikeAPI',
  'TagsAPI',
  'MemberAPI',
  'TasklistAPI'
])
export class DetailAPI extends BaseAPI {
  private ObjectLinkAPI: ObjectLinkAPI;
  private LikeAPI: LikeAPI;
  private TagsAPI: TagsAPI;
  private MemberAPI: MemberAPI;
  private TasklistAPI: TasklistAPI;

  private filedsMap = {
    task: this.fields.taskFileds,
    post: this.fields.postFileds,
    event: this.fields.eventFileds,
    work: this.fields.workFileds
  };

  public fetch (_id: string, type: string, linkedId?: string) {
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
      DetailModel.updateDetail(`${type}:detail:${_id}`, detail);
    });
  }

  public create(type: string, content: any) {
    return this.RestAPI.save({
      Type: `${type}s`
    }, content)
    .$promise
    .then((detail: any) => {
      return DetailModel.setDetail(`${type}:detail:${detail._id}`, detail);
    });
  }

  public delete(type: string, id: string) {
    return this.RestAPI.delete({
      Type: `${type}s`,
      Id: id
    })
    .$promise
    .then(() => {
      DetailModel.removeObject(type, id);
    });
  }

  private query(_id: string, type: string, linkedId: string) {
    let cache = DetailModel.getDetail(`${type}:detail:${_id}`);
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
    detail.like = detailInfos.like;
    detail.detailInfos = detailInfos;
    return DetailModel.setDetail(`${type}:detail:${detail._id}`, detail);
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
