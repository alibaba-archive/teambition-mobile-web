/// <reference path="../interface/teambition.d.ts" />
module teambition {
  'use strict';

  let setDetailIndex = [];

  export interface IDetailModel {
    setDetail(namespace: string, content: ITaskData | IEventData | IPostData | IFileData | IEntryData): ITaskData | IEventData | IPostData | IFileData | IEntryData;
    updateDetail(namespace: string, patch: any): void;
    getDetail(namespace: string): any;
  }

  @inject([
    'socketListener',
    'ActivityModel',
    'TaskModel',
    'EventModel',
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
    private EventModel: IEventModel;
    private ActivityModel: IActivityModel;

    public setDetail(namespace: string, content: any) {
      if (content._id && setDetailIndex.indexOf(content._id) === -1) {
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
        setDetailIndex.push(content._id);
        return result;
      }else {
        if (content.detailInfos) {
          let result = this.parseDetail(namespace, content);
          this._updateObj(namespace, null, result);
          return result;
        }else {
          return this.getDetail(namespace);
        }
      }
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
          return this.postParser(detail);
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
