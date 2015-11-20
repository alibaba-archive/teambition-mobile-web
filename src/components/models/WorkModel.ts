/// <reference path="../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface IWorkModel extends IDetailModel {
    getFolderFilesCollection(projectId: string, folderId: string): IFileDataParsed[];
    setFolderFilesCollection(projectId: string, folderId: string, collection: IFileData[]): IFileDataParsed[];
    getFoldersCollection(projectId: string, parentId: string): ICollectionData[];
    setFoldersCollection(projectId: string, parentId: string, collection: ICollectionData[]): ICollectionData[];
    addFolder(folder: ICollectionData): void;
    removeObject(type: string, id: string): void;
  }

  class WorkModel extends DetailModel implements IWorkModel {

    public getFolderFilesCollection(projectId: string, folderId: string) {
      return this._get<IFileDataParsed[]>('works', `${projectId}:${folderId}`);
    }

    public setFolderFilesCollection(projectId: string, folderId: string, collection: IFileData[]) {
      let cache = this.getFolderFilesCollection(projectId, folderId);
      let results: IFileDataParsed[] = [];
      let $index: string[] = [];
      if (!cache) {
        angular.forEach(collection, (file: IFileData, index: number) => {
          let _id = file._id;
          let result = this.fileParser(file);
          this.setDetail(`work:detail:${_id}`, file);
          results.push(result);
          $index.push(file._id);
        });
      }
      this._set('works:index', folderId, $index);
      this._set('works', `${projectId}:${folderId}`, results);
      return results;
    }

    public getFoldersCollection(projectId: string, parentId: string) {
      return this._get<ICollectionData[]>('collections', `${projectId}:${parentId}`);
    }

    public setFoldersCollection(projectId: string, parentId: string, collections: ICollectionData[]) {
      let cache = this.getFoldersCollection(projectId, parentId);
      let results = [];
      let $index = [];
      if (!cache) {
        angular.forEach(collections, (collection: ICollectionData, index: number) => {
          if (collection.collectionType !== 'default') {
            results.push(collection);
            $index.push(collection._id);
            this._set('collection:detail', collection._id, collection);
          }
        });
      }
      this._set('collections:index', `${projectId}:${parentId}`, $index);
      this._set('collections', `${projectId}:${parentId}`, results);
      return results;
    }

    public addFolder(folder: ICollectionData) {
      let projectId = folder._projectId;
      let parentId = folder._parentId;
      let $index = this._get<string[]>('collections:index', `${projectId}:${parentId}`);
      if ($index.indexOf(folder._id) === -1) {
        let collections = this.getFoldersCollection(projectId, parentId);
        collections.push(folder);
        this._set('collection:detail', folder._id, folder);
        $index.push(folder._id);
        this._set('collections:index', `${projectId}:${parentId}`, $index);
        this._set('collections', `${projectId}:${parentId}`, collections);
      }
    }

    public removeObject(type: string, id: string) {
      let cache = this._get<any>(`${type}:detail`, id);
      let parentId = cache._parentId;
      let projectId = cache._projectId;
      let collectionsCache = this.getFolderFilesCollection(projectId, parentId);
      let cacheIndex = this._get<string[]>(`${type}:index`, `${projectId}:${parentId}`);
      if (collectionsCache) {
        let position = cacheIndex.indexOf(id);
        cacheIndex.splice(position, 1);
        collectionsCache.splice(position, 1);
      }
      this._delete(`${type}:detail`, id);
    }
  }

  angular.module('teambition').service('WorkModel', WorkModel);
}
