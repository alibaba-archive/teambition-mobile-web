'use strict';
import BaseModel from '../bases/BaseModel';
import {fileParser} from '../services/service';
import {IFileData, ICollectionData} from 'teambition';

class WorkModel extends BaseModel {

  public getFolderFilesCollection(projectId: string, folderId: string) {
    return this._get<IFileData[]>('works', folderId);
  }

  public setFolderFilesCollection(projectId: string, folderId: string, collection: IFileData[]) {
    let cache = this.getFolderFilesCollection(projectId, folderId);
    if (!cache) {
      let results: IFileData[] = [];
      let $index: string[] = [];
      angular.forEach(collection, (file: IFileData, index: number) => {
        let _id = file._id;
        let result = fileParser(file);
        result._parentId = folderId;
        this._set(`work:detail`, _id, file);
        results.push(result);
        $index.push(file._id);
      });
      this._set('works:index', folderId, $index);
      this._set('works', folderId, results);
      return results;
    }else {
      return cache;
    }
  }

  public getFoldersCollection(projectId: string, parentId: string) {
    return this._get<ICollectionData[]>('collections', parentId);
  }

  public setFoldersCollection(projectId: string, parentId: string, collections: ICollectionData[]) {
    let cache = this.getFoldersCollection(projectId, parentId);
    if (!cache) {
      let results = [];
      let $index = [];
      angular.forEach(collections, (collection: ICollectionData, index: number) => {
        if (collection.collectionType !== 'default') {
          results.push(collection);
          $index.push(collection._id);
          this._set('collection:detail', collection._id, collection);
        }
      });
      this._set('collections:index', parentId, $index);
      this._set('collections', parentId, results);
      return results;
    }else {
      return cache;
    }
  }

  public addFolder(folder: ICollectionData) {
    let projectId = folder._projectId;
    let parentId = folder._parentId;
    let $index = this._get<string[]>('collections:index', `${projectId}:${parentId}`);
    if ($index && $index.indexOf(folder._id) === -1) {
      let collections = this.getFoldersCollection(projectId, parentId);
      collections.push(folder);
      this._set('collection:detail', folder._id, folder);
      $index.push(folder._id);
      this._set('collections:index', parentId, $index);
      this._set('collections', parentId, collections);
    }
  }

  public addFile(parentId: string, file: IFileData) {
    let collectionCache = this.getFolderFilesCollection(file._projectId, parentId);
    let result = fileParser(file);
    let index = this._get<string[]>('works:index', parentId);
    if (collectionCache && index.indexOf(file._id) === -1) {
      index.unshift(file._id);
      collectionCache.unshift(result);
      this._set('work:detail', file._id, result);
    }else {
      this._set('work:detail', file._id, result);
    }
  }

  public removeObj(type: string, id: string) {
    let namespace = type.substr(0, type.length - 1) + ':detail';
    let cache = this._get<any>(namespace, id);
    let parentId = cache._parentId;
    let collectionsCache = this._get<any[]>(type, parentId);
    let cacheIndex = this._get<string[]>(`${type}:index`, parentId);
    if (collectionsCache) {
      let position = cacheIndex.indexOf(id);
      cacheIndex.splice(position, 1);
      collectionsCache.splice(position, 1);
    }
    this._delete(`${type}:detail`, id);
  }

  public updateDetail(namespace: string, patch: any) {
    return this._updateObj(namespace, null, patch);
  }
}

export default new WorkModel();
