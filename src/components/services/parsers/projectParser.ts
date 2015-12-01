/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';
  export interface IProjectDataParsed extends IProjectData, angular.resource.IResource<any> {
    organizationId?: string;
    organizationName?: string;
    _py?: number;
    style?: string;
    parsed: boolean;
  }

  angular.module('teambition').factory('projectParser', () => {
    return (project: teambition.IProjectDataParsed): IProjectDataParsed => {
      if (project) {
        if (project.parsed) {
          return project;
        }
        let result: IProjectDataParsed = project;
        if (result.organization) {
          result.organizationId = project.organization._id;
          result.organizationName = project.organization.name;
        }
        result._py = project.py.charCodeAt(0);
        result.style = `background-image: url(${project.logo})`;
        return result;
      }
    };
  });
}
