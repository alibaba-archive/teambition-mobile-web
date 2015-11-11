/// <reference path="../../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  @inject([
    'DetailAPI',
    'MemberAPI'
  ])
  class EditInvolveView extends View {
    public ViewName = 'EditInvolveView';

    public detail: any;
    public members: {
      [index: string]: any
    };

    private DetailAPI: IDetailAPI;
    private MemberAPI: IMemberAPI;
    private boundToObjectType: string;
    private boundToObjectId: string;

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
        return this.MemberAPI.fetch(detail._projectId)
        .then((members: {[index: string]: IMemberData}) => {
          this.members = members;
        });
      });
    }

    public onAllChangesDone() {
      angular.forEach(this.members, (member: any) => {
        if (this.detail.involveMembers.indexOf(member._id) !== -1) {
          member.isSelected = true;
        }else {
          member.isSelected = false;
        }
      });
    }

    public selectExecutor(id: string) {
      this.members[id].isSelected = !this.members[id].isSelected;
    }
  }

  angular.module('teambition').controller('EditInvolveView', EditInvolveView);
}
