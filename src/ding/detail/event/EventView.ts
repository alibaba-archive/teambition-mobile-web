'use strict';
import {parentView, inject, View, DetailAPI} from '../../index';
import {IEventData} from 'teambition';

@parentView('DetailView')
@inject([
  'DetailAPI'
])
export class EventView extends View {

  public ViewName = 'EventView';

  public event: IEventData;

  private DetailAPI: DetailAPI;
  private id: string;

  constructor() {
    super();
    this.zone.run(() => {
      this.id = this.$state.params._id;
    });
  }

  public onInit() {
    return this.parent.onInit();
  }

  public onAllChangesDone() {
    this.event = this.parent.detail;
  }

  public updateTitle() {
    this.DetailAPI.update(this.id, 'event', {
      title: this.event.title
    })
    .catch((reason: any) => {
      let message = this.getFailureReason(reason);
      this.showMsg('error', '更新标题失败', message);
    });
  }

  public updateLocation() {
    this.DetailAPI.update(this.id, 'event', {
      location: this.event.location
    })
    .catch((reason: any) => {
      let message = this.getFailureReason(reason);
      this.showMsg('error', '更新地点失败', message);
    });
  }
}

angular.module('teambition').controller('EventView', EventView);
