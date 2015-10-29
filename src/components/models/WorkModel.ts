/// <reference path="../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface IWorkModel extends IDetailModel {
    getFolderFilesCollection(projectId: string, folderId: string): IFileDataParsed[];
    setFolderFilesCollection(projectId: string, folderId: string, collection: IFileDataParsed[]): void;
    getFoldersCollection(projectId: string, folderId: string): ICollectionData[];
    setFoldersCollection(projectId: string, folderId: string, collection: ICollectionData[]): void;
  }

  class WorkModel extends DetailModel implements IWorkModel {
    public getFolderFilesCollection(projectId: string, folderId: string) {
      return this._get<IFileDataParsed[]>('works', `${projectId}:${folderId}`);
    }

    public setFolderFilesCollection(projectId: string, folderId: string, collection: IFileDataParsed[]) {
      let cache = this.getFolderFilesCollection(projectId, folderId);
      if (!cache) {
        this._set('works', `${projectId}:${folderId}`, collection);
      }
    }

    public getFoldersCollection(projectId: string, folderId: string) {
      return this._get<ICollectionData[]>('collections', `${projectId}:${folderId}`);
    }

    public setFoldersCollection(projectId: string, folderId: string, collection: ICollectionData[]) {
      let cache = this.getFoldersCollection(projectId, folderId);
      if (!cache) {
        this._set('collections', `${projectId}:${folderId}`, collection);
      }
    }
  }

  angular.module('teambition').service('WorkModel', WorkModel);
}
