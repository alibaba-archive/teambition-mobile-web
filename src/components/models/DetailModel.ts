/// <reference path="../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface IDetailModel {
    setDetail(namespace: string, content: ITaskData | IEventData | IPostData | IFileData | IEntryData): ITaskData | IEventData | IPostData | IFileData | IEntryData;
    updateDetail(namespace: string, patch: any): void;
    getDetail(namespace: string): any;
    removeObject(type: string, id: string): void;
  }

  @inject([
    'socketListener',
    'ActivityModel',
    'TaskModel',
    'PostModel',
    'EventModel',
    'WorkModel',
    'taskParser',
    'postParser',
    'eventParser',
    'fileParser'
  ])
  export class DetailModel extends BaseModel implements IDetailModel {

    protected taskParser: ITaskParser;
    protected eventParser: IEventParser;
    protected fileParser: IFileParser;
    protected postParser: IPostParser;
    private socketListener: ISocketListener;
    private TaskModel: ITaskModel;
    private PostModel: IPostModel;
    private EventModel: IEventModel;
    private WorkModel: IWorkModel;
    private ActivityModel: IActivityModel;

    public setDetail(namespace: string, content: any) {
      let type = namespace.split(':')[0];
      this.socketListener('new', `activities/${content._id}`, (type: string, data: IActivityDataParsed) => {
        console.log('type: new activities, ', 'data: ', data);
        this.ActivityModel.addActivity(content._id, data);
      });
      this.socketListener('change', `${type}/${content._id}`, (type: string, data: any) => {
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
            this.TaskModel.removeTask(projectId, id);
            break;
          case 'post':
            this.PostModel.removePost(projectId, id);
            break;
          case 'event':
            this.EventModel.removeEvent(projectId, id);
            break;
          case 'work':
            this.WorkModel.removeObj(type, id);
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
          result = this.taskParser(detail);
          this.TaskModel.addTask(result);
          return result;
        case 'post':
          result = this.postParser(detail);
          this.PostModel.addPostToCollection(result);
          return result;
        case 'work':
          return this.fileParser(detail);
        case 'event':
          result = this.eventParser(detail);
          this.EventModel.addEvent(result);
          return result;
      }
    }
  }

  angular.module('teambition').service('DetailModel', DetailModel);
}
