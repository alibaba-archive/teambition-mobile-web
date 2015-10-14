/// <reference path="../interface/teambition.d.ts" />
module teambition {
  'use strict';
  export interface IFileDataParsed extends IFileData {
    parsed: boolean;
    class: string;
    creatorName: string;
    creatorAvatar: string;
    updated: number;
    fileType: string;
    linked?: ILinkedData[];
    isLike?: boolean;
    likedPeople?: string;
    likesCount?: number;
  }

  export type IFileParser = (file: IFileDataParsed) => IFileDataParsed;

  angular.module('teambition').factory('fileParser',
  // @ngInject
  (
    $sanitize: any
  ) => {
    return (file: IFileDataParsed) => {
      if (file.parsed) {
        return file;
      }
      file.creator = file.creator || {_id: null, name: null, avatarUrl: nobodyUrl};
      file.creatorName = file.creator.name;
      file.creatorAvatar = file.creator.avatarUrl;
      file.updated = Date.now();
      if (file.fileType.length > 4) {
        file.class = 'bigger-bigger';
        file.fileType = file.fileType.charAt(0);
      }
      file.parsed = true;
      return file;
    };
  });
}
