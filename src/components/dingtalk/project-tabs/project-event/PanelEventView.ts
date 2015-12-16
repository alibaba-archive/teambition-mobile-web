'use strict';
import {parentView, inject} from '../../../bases/Utils';
import {View} from '../../../bases/View';
import {EventAPI} from '../../../services/service';
import {Ding} from '../../../../Run';
import {IEventData, IEventsResult} from 'teambition';

let projectId: string;

@parentView('TabsView')
@inject([
  'EventAPI'
])
export class PanelEventView extends View {
  public ViewName = 'PanelEventView';

  public eventGroup: {
    [index: string]: IEventData[];
  };
  public counter: number;

  private EventAPI: EventAPI;

  constructor() {
    super();
    this.zone.run(angular.noop);
  }

  public onInit() {
    projectId = this.$state.params._id;
    return this.fetchEvents();
  }

  public onAllChangesDone() {
    if (Ding) {
      Ding.setRight('新建日程', true, false, () => {
        window.location.hash = `/project/${projectId}/event/create`;
      });
    }
  }

  public openEvent(eventId: string) {
    if (!eventId) {
      return;
    }
    window.location.hash = `/detail/event/${eventId}`;
  }

  private fetchEvents() {
    let now = new Date().toISOString();
    return this.EventAPI.fetch(projectId, now)
    .then((eventGroup: IEventsResult) => {
      if (!eventGroup || !eventGroup.data) {
        return ;
      }
      this.eventGroup = eventGroup.data;
      this.counter = eventGroup.counter;
    });

  }
}

angular.module('teambition').controller('PanelEventView', PanelEventView);
