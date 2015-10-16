/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';
  export interface IProjectsAPI {
    fetch(): any;
    fetchById(_id: string): angular.IPromise<IProjectDataParsed>;
    checkProjectsInviteUrl(url: string): angular.IPromise<string | IProjectInviteData>;
    joinByCode(_projectId: string, _signId: string, _invitorId: string): angular.IPromise<IProjectData>;
    deleteProject(_projectId: string): angular.IPromise<IProjectData>;
    unStarProject(_projectId: string): angular.IPromise<IProjectData>;
    starProject(_projectId: string): angular.IPromise<IProjectData>;
    leaveProject(_projectId: string): angular.IPromise<any>;
    archiveProject(_projectId: string): angular.IPromise<IProjectData>;
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
  angular.module('teambition').factory('projectsAPI',
    // @ngInject
    (
      $http: angular.IHttpService,
      $q: angular.IQService,
      RestAPI: teambition.IRestAPI,
      stageAPI: angular.IPromise<IStageData>,
      projectParser: (project: IProjectData) => teambition.IProjectDataParsed,
      Cache: angular.ICacheObject,
      queryFileds: teambition.IqueryFileds,
      getParameterByName: teambition.IGetParmByName
    ): IProjectsAPI => {

      function prepareProject(data: Array<IProjectData>): IProjectDataParsed[] {
        let projects: teambition.IProjectDataParsed[] = [];
        angular.forEach(data, (item: IProjectData, index: number) => {
          let project: teambition.IProjectDataParsed = projectParser(item);
          projects.push(project);
          if (!Cache.get(`projects:${project._id}`)) {
            Cache.put(`projects:${project._id}`, project);
          }
        });
        return projects;
      };

      return <IProjectsAPI>{
        fetch: () => {
          return RestAPI.query({
            Type: 'projects',
            fields: queryFileds.projectFileds
          })
          .$promise
          .then((projects: IProjectData[]) => {
            return prepareProject(projects).sort((left: IProjectDataParsed, right: IProjectDataParsed) => {
              return left._py - right._py;
            });
          });
        },
        fetchById: (_id: string) => {
          let cache: teambition.IProjectDataParsed = Cache.get<teambition.IProjectDataParsed>(`projects:${_id}`);
          if (cache) {
            let deferred = $q.defer<IProjectDataParsed>();
            deferred.resolve(cache);
            return deferred.promise;
          }
          return RestAPI.get({
            Type: 'projects',
            Id: _id,
            fields: queryFileds.projectFileds
          })
          .$promise
          .then((data: IProjectData) => {
            let project: teambition.IProjectDataParsed = projectParser(data);
            Cache.put(`projects:${project._id}`, project);
            return project;
          });
        },
        checkProjectsInviteUrl: (url: string) => {
          let hostArr: string[] = url.replace('http://', '').split('/');
          let deferred = $q.defer<any>();
          if (hostArr[0] === 'tburl.in' || hostArr[0] === 'url.project.ci') {
            hostArr.splice(1, 0, 'codes');
            let host: string = 'http://' + hostArr.join('/');
            $http.get(host)
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
        },
        starProject: (_projectId: string) => {
          return RestAPI.update({
            Type: 'projects',
            Id: _projectId,
            Path1: 'star'
          }, null)
          .$promise;
        },
        unStarProject: (_projectId: string) => {
          return RestAPI.delete({
            Type: 'projects',
            Id: _projectId,
            Path1: 'star'
          })
          .$promise;
        },
        leaveProject: (_projectId: string) => {
          return RestAPI.update({
            Type: 'projects',
            Id: _projectId,
            Path1: 'quit'
          }, null)
          .$promise;
        },
        deleteProject: (_projectId: string) => {
          return RestAPI.delete({
            Type: 'projects',
            Id: _projectId
          })
          .$promise;
        },
        joinByCode: (_projectId: string, _signCode: string, _invitorId: string) => {
          return RestAPI.save({
            Type: 'projects',
            Id: _projectId,
            Path1: 'joinByCode',
            Path2: _signCode
          }, {
            _invitorId: _invitorId
          }, (data: IProjectData) => {
            prepareProject([data]);
          })
          .$promise;
        },
        archiveProject: (_projectId: string) => {
          return RestAPI.update({
            Type: 'projects',
            Id: _projectId
          }, {
            isArchive: true
          })
          .$promise;
        }
      };
    }
  );
}
