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
    'ActivityModel'
  ])
  export class DetailModel extends BaseModel implements IDetailModel {

    private socketListener: ISocketListener;
    private ActivityModel: IActivityModel;

    public setDetail(namespace: string, content: ITaskData | IEventData | IPostData | IFileData) {
      this.socketListener('new', `activities/${content._id}`, (type: string, data: IActivityDataParsed) => {
        console.log('type: ', type, 'data: ', data);
        this.ActivityModel.addActivity(content._id, data);
      });
      this._set(namespace, null, content);
    }

    public updateDetail(namespace: string, patch: any) {
      this._updateObj(namespace, null, patch);
    }

    public getDetail(namespace: string) {
      return this._get(namespace);
    }
  }

  angular.module('teambition').service('DetailModel', DetailModel);
}
