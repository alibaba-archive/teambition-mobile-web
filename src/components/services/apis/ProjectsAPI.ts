'use strict';
import {app} from '../../config/config';
import BaseAPI from '../../bases/BaseAPI';
import {
  Iapp,
  IProjectData,
  ITburlData,
  IProjectInviteData
} from 'teambition';
import ProjectModel from '../../models/ProjectModel';
import {fields} from './fields';

export class ProjectsAPI extends BaseAPI {

  public fetch() {
    let cache = ProjectModel.getCollection();
    if (cache) {
      let deferred = this.$q.defer();
      deferred.resolve(cache);
      return deferred.promise;
    }
    return this.RestAPI.query({
      Type: 'projects',
      fields: fields.projectFileds
    })
    .$promise
    .then((projects: IProjectData[]) => {
      ProjectModel.setCollection(projects);
      return projects;
    });
  }

  public fetchById(_id: string) {
    if (app.socket) {
      app.socket.join(_id);
    }
    let cache: IProjectData = ProjectModel.get(_id);
    if (cache) {
      let deferred = this.$q.defer<IProjectData>();
      deferred.resolve(cache);
      return deferred.promise;
    }
    return this.RestAPI.get({
      Type: 'projects',
      Id: _id,
      fields: fields.projectFileds
    })
    .$promise
    .then((data: IProjectData) => {
      ProjectModel.set(data);
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
    .then((data: IProjectData) => {
      return ProjectModel.updateObj(data._id, data);
    });
  }

  public unStarProject(_projectId: string) {
    return this.RestAPI.delete({
      Type: 'projects',
      Id: _projectId,
      Path1: 'star'
    })
    .$promise
    .then((data: IProjectData) => {
      return ProjectModel.updateObj(data._id, data);
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
      ProjectModel.remove(_projectId);
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
      ProjectModel.set(data);
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
      ProjectModel.updateObj(data._id, data);
      return ProjectModel.get(data._id);
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
      ProjectModel.set(project);
    });
  }
}

angular.module('teambition').service('ProjectsAPI', ProjectsAPI);
