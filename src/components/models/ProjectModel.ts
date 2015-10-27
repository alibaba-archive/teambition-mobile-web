/// <reference path="../interface/teambition.d.ts" />

module teambition {
  'use strict';

  export interface IProjectModel {
    set(id: string, content: any): void;
    updateObj(id: string, patch: any): IProjectDataParsed;
    get(id: string): IProjectDataParsed;
  }

  export class ProjectModel extends BaseModel implements IProjectModel {
    'use strict';
    public set(id: string, content: any) {
      this._set('project', id, content);
    }

    public updateObj(id: string, patch: any) {
      return this._updateObj<IProjectDataParsed>('project', id, patch);
    }

    public get(id: string) {
      return this.Cache.get<IProjectDataParsed>(`project:${id}`);
    }
  }

  angular.module('teambition').service('ProjectModel', ProjectModel);
}
