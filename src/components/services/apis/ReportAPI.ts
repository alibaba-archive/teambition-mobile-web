'use strict';
import BaseAPI from '../../bases/BaseAPI';

export class ReportAPI extends BaseAPI {
  public fetch(_id: string, data: any) {
    return this.RestAPI.get({
      Type: 'organizations',
      _id: _id,
      Path1: 'statistics',
      Path2: data,
      fields: this.fields.reportFileds
    });
  }
}

angular.module('teambition').service('ReportAPI', ReportAPI);
