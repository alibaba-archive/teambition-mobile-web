/// <reference path="../../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  let projectId: string;

  @parentView('TabsView')
  export class PanelEventView extends View {
    public ViewName = 'PanelEventView';

    public eventGroup: {
      [index: string]: IEventDataParsed[];
    };
    public counter: number;

    private eventAPI: IEventAPI;

    // @ngInject
    constructor(
      eventAPI: IEventAPI
    ) {
      super();
      this.eventAPI = eventAPI;
      this.zone.run(noop);
    }

    public onInit() {
      projectId = this.$state.params._id;
      return this.fetchEvents();
    }

    public openEvent(eventId: string) {
      if (!eventId) {
        return;
      }
      window.location.hash = `/detail/event/${eventId}`;
    }

    private fetchEvents() {
      let now = new Date().toISOString();
      return this.eventAPI.fetch(projectId, now)
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
