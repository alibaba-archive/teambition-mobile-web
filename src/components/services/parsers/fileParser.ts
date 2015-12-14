'use strict';
import {nobodyUrl} from '../../config/config';
import {IFileData} from 'teambition';

export const fileParser = (file: IFileData) => {
  file.creator = file.creator || {_id: null, name: null, avatarUrl: nobodyUrl};
  file.creatorName = file.creator.name;
  file.creatorAvatar = file.creator.avatarUrl;
  file.updated = Date.now();
  if (file.fileType.length > 4) {
    file.class = 'bigger-bigger';
    file.fileType = file.fileType.charAt(0);
  }
  return file;
};
