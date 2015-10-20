/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface IStrikerAPI {
    upload(blobs: File[]): angular.IPromise<any>;
  }

  angular.module('teambition').factory('strikerAPI',
  // @ngInject
  (
    app: Iapp,
    Upload: angular.angularFileUpload.IUploadService,
    RestAPI: IRestAPI
  ) => {
    let strikerAuth = () => {
      return RestAPI.get({
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
    };
    return {
      upload: (blobs: File) => {
        strikerAuth().then((strikerAuth: string) => {
          return Upload.upload({
            url: app.strikerHost + 'upload',
            headers: {
              'Authorization': strikerAuth,
              'Content-Type': 'multipart/form-data'
            },
            file: blobs,
            withCredentials: true,
            method: 'POST'
          });
        });
      }
    };
  });
}
