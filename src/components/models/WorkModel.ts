/// <reference path="../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface IWorkModel extends IDetailModel {
    getFolderFilesCollection(projectId: string, folderId: string): IFileDataParsed[];
    setFolderFilesCollection(projectId: string, folderId: string, collection: IFileData[]): IFileDataParsed[];
    getFoldersCollection(projectId: string, folderId: string): ICollectionData[];
    setFoldersCollection(projectId: string, folderId: string, collection: ICollectionData[]): ICollectionData[];
  }

  @inject([
    'fileParser'
  ])
  class WorkModel extends DetailModel implements IWorkModel {

    private fileParser: IFileParser;

    public getFolderFilesCollection(projectId: string, folderId: string) {
      return this._get<IFileDataParsed[]>('works', `${projectId}:${folderId}`);
    }

    public setFolderFilesCollection(projectId: string, folderId: string, collection: IFileData[]) {
      let cache = this.getFolderFilesCollection(projectId, folderId);
      let results: IFileDataParsed[] = [];
      if (!cache) {
        angular.forEach(collection, (file: IFileData, index: number) => {
          let _id = file._id;
          let result = this.fileParser(file);
          this.setDetail(`work:detail:${_id}`, file);
          results.push(result);
        });
      }
      this._set('works', `${projectId}:${folderId}`, results);
      return results;
    }

    public getFoldersCollection(projectId: string, folderId: string) {
      return this._get<ICollectionData[]>('collections', `${projectId}:${folderId}`);
    }

    public setFoldersCollection(projectId: string, folderId: string, collection: ICollectionData[]) {
      let cache = this.getFoldersCollection(projectId, folderId);
      let results = [];
      if (!cache) {
        angular.forEach(collection, (collection: ICollectionData, index: number) => {
          if (collection.collectionType !== 'default') {
            results.push(collection);
          }
        });
      }
      this._set('collections', `${projectId}:${folderId}`, results);
      return results;
    }
  }

  angular.module('teambition').service('WorkModel', WorkModel);
}
