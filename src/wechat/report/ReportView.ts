import {inject, View, ReportAPI} from '../index';

@inject([
  'ReportAPI'
])
class ReportView extends View {
  public organizationId: string;

  private ReportAPI: ReportAPI;

  public onInit() {
    this.organizationId = this.$state.params._id;
    const data = this.$state.params.data;
    return this.ReportAPI.fetch(this.organizationId, data);
  }
}

angular.module('teambition').controller('ReportView', ReportView);
