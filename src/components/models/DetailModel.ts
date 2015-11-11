/// <reference path="../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface IDetailModel {
    setDetail(namespace: string, content: ITaskData | IEventData | IPostData | IFileData | IEntryData): void;
    updateDetail(namespace: string, patch: any): void;
    getDetail(namespace: string): any;
  }

  @inject([
    'socketListener',
    'ActivityModel',
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
      this._set(namespace, null, content);
      return this.parseDetail(namespace, content);
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
      switch (type) {
        case 'task':
          return this.taskParser(detail);
        case 'post':
          return this.postParser(detail);
        case 'work':
          return this.fileParser(detail);
        case 'event':
          return this.eventParser(detail);
      }
    }
  }

  angular.module('teambition').service('DetailModel', DetailModel);
}
