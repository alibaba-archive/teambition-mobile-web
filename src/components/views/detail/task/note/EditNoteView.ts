/// <reference path="../../../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  @inject([
    'DetailAPI'
  ])
  class EditNoteView extends View {
    public ViewName = 'EditNoteView';

    public detail: any;

    private DetailAPI: IDetailAPI;
    private boundToObjectId: string;
    private boundToObjectType: string;

    constructor() {
      super();
      this.zone.run(() => {
        this.boundToObjectId = this.$state.params._id;
        this.boundToObjectType = this.$state.params.type;
      });
    }

    public onInit() {
      return this.DetailAPI.fetch(this.boundToObjectId, this.boundToObjectType)
      .then((detail: any) => {
        this.detail = detail;
      });
    }

  }

  angular.module('teambition').controller('EditNoteView', EditNoteView);
}
