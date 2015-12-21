import {inject, View, ReportAPI} from '../index';

@inject([
  'ReportAPI'
])
class ReportView extends View {
  public organizationId = this.$state.params._id;

  private ReportAPI: ReportAPI;

  constructor() {
    super();
    this.zone.run(angular.noop);
  }

  public onInit() {
    const data = this.$state.params.data;
    return this.ReportAPI.fetch(this.organizationId, data);
  }
}

angular.module('teambition').controller('ReportView', ReportView);
