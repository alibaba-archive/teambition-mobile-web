/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface IStrikerAPI {
    upload(blobs: File[], scope?: any): angular.IPromise<angular.IHttpPromiseCallbackArg<{}>>;
  }

  @inject([
    'app',
    'Upload'
  ])
  class StrikerAPI extends BaseAPI implements IStrikerAPI {
    private app: Iapp;
    private Upload: angular.angularFileUpload.IUploadService;

    public upload (blobs: File[], scope?: any) {
      return this.strikerAuth().then((strikerAuth: string) => {
        return this.Upload.upload({
          url: `${this.app.strikerHost}/upload`,
          headers: {
            'Authorization': strikerAuth,
            'Content-Type': 'multipart/form-data'
          },
          file: blobs,
          withCredentials: true,
          method: 'POST'
        })
        .then((res: any) => {
          return res.data;
        }, (resp: any) => {
          console.log(resp);
        }, (evt: any) => {
          if (scope && scope.progress) {
            scope.progress = 100.0 * evt.loaded / evt.total + '%';
          }
        });
      });
    }

    private strikerAuth () {
      return this.RestAPI.get({
        Type: 'users',
        Id: 'me',
        fields: 'strikerAuth'
      })
      .$promise
      .then((me: any) => {
        if (me.strikerAuth) {
          return me.strikerAuth;
        }else {
          return false;
        }
      });
    }
  }

  angular.module('teambition').service('StrikerAPI', StrikerAPI);
}
