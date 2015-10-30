/// <reference path="../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface IDetailModel {
    setDetail(namespace: string, content: ITaskData | IEventData | IPostData | IFileData | IEntryData): void;
    updateDetail(namespace: string, patch: any): void;
  }

  export class DetailModel extends BaseModel implements IDetailModel {

    public setDetail(namespace: string, content: ITaskData | IEventData | IPostData | IFileData) {
      this._set(namespace, null, content);
    }

    public updateDetail(namespace: string, patch: any) {
      this._updateObj(namespace, null, patch);
    }
  }

  angular.module('teambition').service('DetailModel', DetailModel);
}
