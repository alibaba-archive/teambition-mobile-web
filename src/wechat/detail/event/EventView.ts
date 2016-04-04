'use strict';
import {View, parentView} from '../../index';
import {IEventData} from 'teambition';

@parentView('DetailView')
export class EventView extends View {

  public event: IEventData;

  public onInit() {
    return this.parent.onInit();
  }

  public onAllChangesDone() {
    this.event = this.parent.detail;
  }
}

angular.module('teambition').controller('EventView', EventView);
