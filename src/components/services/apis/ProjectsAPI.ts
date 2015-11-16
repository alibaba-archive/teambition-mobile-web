/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';
  export interface IProjectsAPI {
    fetch(): any;
    fetchById(_id: string): angular.IPromise<IProjectDataParsed>;
    checkProjectsInviteUrl(url: string): angular.IPromise<string | IProjectInviteData>;
    joinByCode(_projectId: string, _signId: string, _invitorId: string): angular.IPromise<IProjectData>;
    deleteProject(_projectId: string): angular.IPromise<any>;
    unStarProject(_projectId: string): angular.IPromise<IProjectDataParsed>;
    starProject(_projectId: string): angular.IPromise<IProjectDataParsed>;
    leaveProject(_projectId: string): angular.IPromise<any>;
    archiveProject(_projectId: string): angular.IPromise<IProjectDataParsed>;
    createProject(
      name: string,
      _organizationId?: string,
      description?: string,
      logo?: string,
      category?: string,
      dividerIndex?: string
    ): angular.IPromise<void>;
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
    'app',
    'ProjectModel'
  ])
  class ProjectsAPI extends BaseAPI implements IProjectsAPI {
    private app: Iapp;
    private ProjectModel: IProjectModel;

    public fetch() {
      let cache = this.ProjectModel.getCollection();
      if (cache) {
        let deferred = this.$q.defer();
        deferred.resolve(cache);
        return deferred.promise;
      }
      return this.RestAPI.query({
        Type: 'projects',
        fields: this.queryFileds.projectFileds
      })
      .$promise
      .then((projects: IProjectData[]) => {
        this.ProjectModel.setCollection(projects);
        return projects;
      });
    }

    public fetchById(_id: string) {
      if (this.app.socket) {
        this.app.socket.join(_id);        
      }
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
        this.ProjectModel.set(data);
        return data;
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
        return this.ProjectModel.updateObj(data._id, data);
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
      .$promise
      .then(() => {
        this.ProjectModel.remove(_projectId);
      });
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
        this.ProjectModel.set(data);
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
      .$promise
      .then((data: IProjectData) => {
        this.ProjectModel.updateObj(data._id, data);
        return this.ProjectModel.get(data._id);
      });
    }

    public createProject(
      name: string,
      _organizationId?: string,
      description?: string,
      logo?: string,
      category?: string,
      dividerIndex?: string
    ) {
      return this.RestAPI.save({
        Type: 'projects'
      }, {
        name: name,
        _organizationId: _organizationId,
        description: description,
        logo: logo,
        category: category,
        dividerIndex: dividerIndex
      })
      .$promise
      .then((project: IProjectData) => {
        this.ProjectModel.set(project);
      });
    }
  }

  angular.module('teambition').service('ProjectsAPI', ProjectsAPI);
}
