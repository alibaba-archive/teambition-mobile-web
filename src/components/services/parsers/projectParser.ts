'use strict';

import {IProjectData} from 'teambition';

export const projectParser = (project: IProjectData): IProjectData => {
  if (project) {
    if (project.parsed) {
      return project;
    }
    let result: IProjectData = project;
    if (result.organization) {
      result.organizationId = project.organization._id;
      result.organizationName = project.organization.name;
    }
    result._py = project.py.charCodeAt(0);
    result.style = `background-image: url(${project.logo})`;
    return result;
  }
};
