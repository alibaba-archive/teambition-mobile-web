'use strict';
import BaseModel from '../bases/BaseModel';
import ActivityModel from './ActivityModel';
import TaskModel from './TaskModel';
import PostModel from './PostModel';
import EventModel from './EventModel';
import WorkModel from './WorkModel';
import {
  socketListener,
  taskParser,
  postParser,
  eventParser,
  fileParser
} from '../services';
import {nobodyUrl} from '../config/config';
import {IMemberData, IActivityData} from 'teambition';


class DetailModel extends BaseModel {

  public setDetail(namespace: string, content: any) {
    let type = namespace.split(':')[0];
    socketListener('new', `activities/${content._id}`, (type: string, data: IActivityData) => {
      console.log('type: new activities, ', 'data: ', data);
      ActivityModel.addActivity(content._id, data);
    });
    socketListener('change', `${type}/${content._id}`, (type: string, data: any) => {
      console.log('change, detail: ', data);
      this.updateDetail(namespace, data);
    });
    let result = this.parseDetail(namespace, content);
    this._set(namespace, null, result);
    this._updateObj(namespace, null, content);
    return result;
  }

  public updateDetail(namespace: string, patch: any) {
    let patched = this._updateObj(namespace, null, patch);
    if (patched) {
      return this.parseDetail(namespace, patched);
    }
  }

  public getDetail(namespace: string) {
    return this._get(namespace);
  }

  public removeObject(type: string, id: string) {
    let detail = this._get<any>(`${type}:detail`, id);
    if (detail) {
      let projectId = detail._projectId;
      switch (type) {
        case 'task':
          TaskModel.removeTask(projectId, id);
          break;
        case 'post':
          PostModel.removePost(projectId, id);
          break;
        case 'event':
          EventModel.removeEvent(projectId, id);
          break;
        case 'work':
          WorkModel.removeObj(type, id);
          break;
      }
    }
  }

  private parseDetail(namespace: string, detail: any): any {
    let type = namespace.split(':')[0];
    let members = detail.detailInfos ? detail.detailInfos.members : null;
    let involveMembers = [];
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
    let result: any;
    switch (type) {
      case 'task':
        result = taskParser(detail);
        TaskModel.addTask(result);
        return result;
      case 'post':
        result = postParser(detail);
        PostModel.addPostToCollection(result);
        return result;
      case 'work':
        return fileParser(detail);
      case 'event':
        result = eventParser(detail);
        EventModel.addEvent(result);
        return result;
    }
  }
}

export default new DetailModel();
