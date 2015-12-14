'use strict';
import BaseAPI from '../../bases/BaseAPI';
import WorkModel from '../../models/WorkModel';
import {IStrikerRes, IFileData, ICollectionData} from 'teambition';

export class WorkAPI extends BaseAPI {

  public upload (_parentId: string, strikerRes: IStrikerRes) {
    let {
      fileName,
      fileSize,
      fileType,
      fileCategory,
      fileKey
    } = strikerRes;
    return this.RestAPI.save({
      Type: 'works'
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
      angular.forEach(data, (file: IFileData, index: number) => {
        WorkModel.addFile(_parentId, file);
      });
      return data;
    });
  }

  public fetchWorks (_projectId: string, _parentId: string) {
    let cache = WorkModel.getFolderFilesCollection(_projectId, _parentId);
    let deferred = this.$q.defer<IFileData[]>();
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
      fields: this.fields.workFileds
    })
    .$promise
    .then((works: IFileData[]) => {
      let result = this.prepareWorks(works, _projectId, _parentId);
      return result;
    });
  }

  public fetchCollections (_projectId: string, _collectionId: string) {
    let cache = WorkModel.getFoldersCollection(_projectId, _collectionId);
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

  public createCollection(title: string, parentId: string, description?: string, color?: string) {
    return this.RestAPI.save({
      Type: 'collections'
    }, {
      title: title,
      _parentId: parentId,
      description: description,
      color: color
    })
    .$promise
    .then((collection: ICollectionData) => {
      WorkModel.addFolder(collection);
    });
  }

  public rename(type: string, id: string, name: string, description?: string, color?: string) {
    let update: {
      description?: string;
      color?: string;
      title?: string;
      fileName?: string;
    };
    update = {
      description: description
    };
    let key: string;
    if (type === 'collections') {
      key = 'title';
      update.color = color;
    }else {
      key = 'fileName';
    }
    update[key] = name;
    return this.RestAPI.update({
      Type: type,
      Id: id
    }, update)
    .$promise
    .then((data: any) => {
      let namespace = type.substr(0, type.length - 1) + `:detail:${data._id}`;
      WorkModel.updateDetail(namespace, data);
    });
  }

  public delete(type: string, id: string) {
    return this.RestAPI.delete({
      Type: type,
      Id: id
    })
    .$promise
    .then(() => {
      WorkModel.removeObj(type, id);
    });
  }

  private prepareWorks (works: IFileData[], _projectId: string, _parentId: string) {
    if (works) {
      return WorkModel.setFolderFilesCollection(_projectId, _parentId, works);
    }
  }

  private prepareCollections (collections: ICollectionData[], _projectId: string, _collectionId: string) {
    if (!collections.length) {
      return collections;
    }
    return WorkModel.setFoldersCollection(_projectId, _collectionId, collections);
  }
}

angular.module('teambition').service('WorkAPI', WorkAPI);
