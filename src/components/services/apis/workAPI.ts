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

  angular.module('teambition').factory('workAPI',
  // @ngInject
  (
    $q: angular.IQService,
    RestAPI: IRestAPI,
    fileParser: IFileParser,
    Cache: angular.ICacheObject,
    queryFileds: IqueryFileds
  ) => {

    let prepareWorks = (works: IFileData[], _projectId: string, _parentId: string) => {
      if (!works.length) {
        return [];
      }
      let results = <IFileDataParsed[]>[];
      angular.forEach(works, (file: IFileDataParsed, index: number) => {
        let _id = file._id;
        let result = fileParser(file);
        Cache.put(`work:detail:${_id}`, result);
        results.push(result);
      });
      Cache.put(`works:${_projectId}:${_projectId}`, results);
      return results;
    };

    let prepareCollections = (collections: ICollectionData[], _projectId: string, _collectionId: string) => {
      if (!collections.length) {
        return [];
      }
      let results = <ICollectionData[]>[];
      angular.forEach(collections, (collection: ICollectionData, index: number) => {
        if (collection.collectionType !== 'default') {
          results.push(collection);
        }
      });
      Cache.put(`collections:${_projectId}:${_collectionId}`, results);
      return results;
    };


    return <IWorkAPI>{
      /**
       * http://docs.teambition.com/teambition/works/create.html
       */
      upload: (_parentId: string, strikerRes: IStrikerRes) => {
        let {
          fileName,
          fileSize,
          fileType,
          fileCategory,
          fileKey
        } = strikerRes;
        return RestAPI.save({
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
      },
      uploads: (_parentId: string, _projectId: string, works: IStrikerRes[]) => {
        return RestAPI.post({
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
      },
      fetchWorks: (_projectId: string, _parentId: string) => {
        let cache = Cache.get<IFileDataParsed[]>(`works:${_projectId}:${_parentId}`);
        let deferred = $q.defer();
        if (cache) {
          deferred.resolve(cache);
          return deferred.promise;
        }
        return RestAPI.query({
          Type: 'projects',
          Id: _projectId,
          Path1: 'collections',
          Path2: _parentId,
          Path3: 'works',
          fields: queryFileds.workFileds
        })
        .$promise
        .then((works: IFileData[]) => {
          let result = prepareWorks(works, _projectId, _parentId);
          return result;
        });
      },
      fetchCollections: (_projectId: string, _collectionId: string) => {
        let cache = Cache.get<ICollectionData>(`collections:${_projectId}:${_collectionId}`);
        let deferred = $q.defer();
        if (cache) {
          deferred.resolve(cache);
          return deferred.promise;
        }
        return RestAPI.query({
          Type: 'collections',
          all: true,
          _parentId: _collectionId,
          _projectId: _projectId
        })
        .$promise
        .then((collections: ICollectionData[]) => {
          let result = prepareCollections(collections, _projectId, _collectionId);
          return result;
        });
      }
    };
  });
}
