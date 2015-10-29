/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface IStrikerRes {
    fileName: string;
    fileSize: string;
    fileType: string;
    fileCategory: string;
    fileKey: string;
  }

  export interface IWorkAPI {
    upload: (_parentId: string, strikerRes: IStrikerRes) => angular.IPromise<IFileData>;
    uploads: (_parentId: string, _projectId: string, works: IStrikerRes[]) => angular.IPromise<IFileData[]>;
    fetchWorks: (_projectId: string, _parentId: string) => angular.IPromise<IFileDataParsed[]>;
    fetchCollections: (_projectId: string, _collectionId: string) => angular.IPromise<ICollectionData[]>;
  }

  @inject([
    'fileParser',
    'WorkModel'
  ])
  class WorkAPI extends BaseAPI implements IWorkAPI {
    private fileParser: IFileParser;
    private WorkModel: IWorkModel;

    public upload (_parentId: string, strikerRes: IStrikerRes) {
      let {
        fileName,
        fileSize,
        fileType,
        fileCategory,
        fileKey
      } = strikerRes;
      return this.RestAPI.save({
        Type: 'work'
      }, {
        _parentId: _parentId,
        fileName: fileName,
        fileSize: fileSize,
        fileType: fileType,
        fileCategory: fileCategory,
        fileKey: fileKey
      })
      .$promise
      .then((data: IFileData) => {
        return data;
      });
    }

    public uploads (_parentId: string, _projectId: string, works: IStrikerRes[]) {
      return this.RestAPI.post({
        Type: 'works'
      }, {
        _parentId: _parentId,
        _projectId: _projectId,
        works: works
      })
      .$promise
      .then((data: IFileData[]) => {
        return data;
      });
    }

    public fetchWorks (_projectId: string, _parentId: string) {
      let cache = this.WorkModel.getFolderFilesCollection(_projectId, _parentId);
      let deferred = this.$q.defer<IFileDataParsed[]>();
      if (cache) {
        deferred.resolve(cache);
        return deferred.promise;
      }
      return this.RestAPI.query({
        Type: 'projects',
        Id: _projectId,
        Path1: 'collections',
        Path2: _parentId,
        Path3: 'works',
        fields: this.queryFileds.workFileds
      })
      .$promise
      .then((works: IFileData[]) => {
        let result = this.prepareWorks(works, _projectId, _parentId);
        return result;
      });
    }

    public fetchCollections (_projectId: string, _collectionId: string) {
      let cache = this.WorkModel.getFoldersCollection(_projectId, _collectionId);
      let deferred = this.$q.defer<ICollectionData[]>();
      if (cache) {
        deferred.resolve(cache);
        return deferred.promise;
      }
      return this.RestAPI.query({
        Type: 'collections',
        all: true,
        _parentId: _collectionId,
        _projectId: _projectId
      })
      .$promise
      .then((collections: ICollectionData[]) => {
        let result = this.prepareCollections(collections, _projectId, _collectionId);
        return result;
      });
    }

    private prepareWorks (works: IFileData[], _projectId: string, _parentId: string) {
      if (!works.length) {
        return [];
      }
      let results = <IFileDataParsed[]>[];
      angular.forEach(works, (file: IFileDataParsed, index: number) => {
        let _id = file._id;
        let result = this.fileParser(file);
        this.WorkModel.setDetail(`work:detail:${_id}`, file);
        results.push(result);
      });
      this.WorkModel.setFolderFilesCollection(_projectId, _parentId, results);
      return results;
    }

    private prepareCollections (collections: ICollectionData[], _projectId: string, _collectionId: string) {
      if (!collections.length) {
        return [];
      }
      let results = <ICollectionData[]>[];
      angular.forEach(collections, (collection: ICollectionData, index: number) => {
        if (collection.collectionType !== 'default') {
          results.push(collection);
        }
      });
      this.WorkModel.setFoldersCollection(_projectId, _collectionId, results);
      return results;
    }
  }

  angular.module('teambition').service('WorkAPI', WorkAPI);
}
