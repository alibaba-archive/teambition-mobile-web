/// <reference path="../../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  let projectId: string;

  @parentView('TabsView')
  @inject([
    'EventAPI'
  ])
  export class PanelEventView extends View {
    public ViewName = 'PanelEventView';

    public eventGroup: {
      [index: string]: IEventDataParsed[];
    };
    public counter: number;

    private EventAPI: IEventAPI;

    constructor() {
      super();
      this.zone.run(noop);
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
}
