/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';
  export interface IProjectsAPI {
    fetch(): any;
    fetchById(_id: string): angular.IPromise<IProjectDataParsed>;
    checkProjectsInviteUrl(url: string): angular.IPromise<string | IProjectInviteData>;
    joinByCode(_projectId: string, _signId: string, _invitorId: string): angular.IPromise<IProjectData>;
    deleteProject(_projectId: string): angular.IPromise<IProjectDataParsed>;
    unStarProject(_projectId: string): angular.IPromise<IProjectDataParsed>;
    starProject(_projectId: string): angular.IPromise<IProjectDataParsed>;
    leaveProject(_projectId: string): angular.IPromise<any>;
    archiveProject(_projectId: string): angular.IPromise<IProjectDataParsed>;
  }

  export interface ITburlData {
    statusCode: number;
    isExist: boolean;
    code: string;
    origin?: string;
  }

  export interface IProjectInviteData {
    projectId: string;
    invitorId: string;
    signCode: string;
  }

  export interface IProjectData {
    _id: string;
    name: string;
    logo: string;
    py: string;
    isPublic: boolean;
    created: string;
    isStar: boolean;
    starsCount: number;
    canArchive: boolean;
    canQuit: boolean;
    canDelete: boolean;
    deleted: boolean;
    organization: {
      name: string;
      description: string;
      logo: string;
      isPublic: boolean;
      _id: string;
      isExpired: boolean;
    };
    signCode: string;
    _rootCollectionId: string;
    _defaultCollectionId: string;
  }

  @inject([
    'projectParser',
    'Cache',
    'queryFileds',
    'ProjectModel'
  ])
  class ProjectsAPI extends BaseAPI implements IProjectsAPI {
    private projectParser: (project: IProjectData) => teambition.IProjectDataParsed;
    private Cache: angular.ICacheObject;
    private queryFileds: teambition.IqueryFileds;
    private ProjectModel: IProjectModel;

    public fetch() {
      return this.RestAPI.query({
        Type: 'projects',
        fields: this.queryFileds.projectFileds
      })
      .$promise
      .then((projects: IProjectData[]) => {
        return this.prepareProject(projects)
        .sort((left: IProjectDataParsed, right: IProjectDataParsed) => {
          return left._py - right._py;
        });
      });
    }

    public fetchById(_id: string) {
      let cache: teambition.IProjectDataParsed = this.ProjectModel.get(_id);
      if (cache) {
        let deferred = this.$q.defer<IProjectDataParsed>();
        deferred.resolve(cache);
        return deferred.promise;
      }
      return this.RestAPI.get({
        Type: 'projects',
        Id: _id,
        fields: this.queryFileds.projectFileds
      })
      .$promise
      .then((data: IProjectData) => {
        let project: teambition.IProjectDataParsed = this.projectParser(data);
        this.ProjectModel.set(project._id, project);
        return project;
      });
    }

    public checkProjectsInviteUrl (url: string) {
      let hostArr: string[] = url.replace('http://', '').split('/');
      let deferred = this.$q.defer<any>();
      if (hostArr[0] === 'tburl.in' || hostArr[0] === 'url.project.ci') {
        hostArr.splice(1, 0, 'codes');
        let host: string = 'http://' + hostArr.join('/');
        this.$http.get(host)
        .success((data: ITburlData, status: number, headers: any, config: any) => {
          if (data.isExist) {
            let origin: string = data.origin.split('/').pop();
            origin = decodeURIComponent(origin);
            let originParams: string[] = origin.split('/');
            let invitorId = originParams.pop();
            let signCode = originParams.pop();
            let projectId = originParams.pop();
            deferred.resolve(<IProjectInviteData>{
              invitorId: invitorId,
              signCode: signCode,
              projectId: projectId
            });
          }else {
            deferred.reject('notValid');
          }
        });
      }else {
        deferred.reject('notValid');
      }
      return deferred.promise;
    }

    public starProject(_projectId: string) {
      return this.RestAPI.update({
        Type: 'projects',
        Id: _projectId,
        Path1: 'star'
      }, null)
      .$promise
      .then((data: IProjectDataParsed) => {
        let oldCache = this.Cache.get<IProjectDataParsed>(`project:${data._id}`);
        oldCache.isStar = data.isStar;
        oldCache.starsCount = data.starsCount;
        this.Cache.put(`project:${data._id}`, oldCache);
        return oldCache;
      });
    }

    public unStarProject(_projectId: string) {
      return this.RestAPI.delete({
        Type: 'projects',
        Id: _projectId,
        Path1: 'star'
      })
      .$promise
      .then((data: IProjectDataParsed) => {
        return this.ProjectModel.updateObj(data._id, data);
      });
    }

    public leaveProject(_projectId: string) {
      return this.RestAPI.update({
        Type: 'projects',
        Id: _projectId,
        Path1: 'quit'
      }, null)
      .$promise;
    }

    public deleteProject (_projectId: string) {
      return this.RestAPI.delete({
        Type: 'projects',
        Id: _projectId
      })
      .$promise;
    }

    public joinByCode(_projectId: string, _signCode: string, _invitorId: string) {
      return this.RestAPI.save({
        Type: 'projects',
        Id: _projectId,
        Path1: 'joinByCode',
        Path2: _signCode
      }, {
        _invitorId: _invitorId
      }, (data: IProjectData) => {
        this.prepareProject([data]);
      })
      .$promise;
    }

    public archiveProject(_projectId: string) {
      return this.RestAPI.update({
        Type: 'projects',
        Id: _projectId
      }, {
        isArchive: true
      })
      .$promise;
    }

    private prepareProject(data: Array<IProjectData>): IProjectDataParsed[] {
      let projects: IProjectDataParsed[] = [];
      angular.forEach(data, (item: IProjectData, index: number) => {
        let project: IProjectDataParsed = this.projectParser(item);
        projects.push(project);
        this.ProjectModel.set(project._id, project);
      });
      return projects;
    }
  }

  angular.module('teambition').service('ProjectsAPI', ProjectsAPI);
}
