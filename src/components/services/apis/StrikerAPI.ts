'use strict';
import {inject} from '../../bases/Utils';
import BaseAPI from '../../bases/BaseAPI';
import {app} from '../../config/config';

@inject([
  'Upload'
])
export class StrikerAPI extends BaseAPI {
  private Upload: angular.angularFileUpload.IUploadService;

  public upload (blobs: File[], scope?: any) {
    return this.strikerAuth().then((strikerAuth: string) => {
      return this.Upload.upload({
        url: `${app.strikerHost}/upload`,
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
