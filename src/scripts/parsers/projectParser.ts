/// <reference path="../interface/teambition.d.ts" />
module teambition {
  'use strict';
  export interface IProjectDataParsed extends teambition.IProjectData {
    organizationId?: string;
    organizationName?: string;
    _py?: number;
    style?: string;
  }

  angular.module('teambition').factory('projectParser', () => {
    return (project: teambition.IProjectData): IProjectDataParsed => {
      if (project) {
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
