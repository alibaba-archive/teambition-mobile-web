/// <reference path="../../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  @inject([
    'DetailAPI',
    'MemberAPI',
    'Rrule'
  ])
  class CreateEventView extends View {

    public ViewName = 'CreateEventView';

    public title: string;
    public startDate: Date | string;
    public endDate: Date | string;
    public involveMembers: string[];
    public location: string;
    public content: string;
    public recurrenceStr: string;
    public isVisiable = false;
    public members: {
      [index: string]: IMemberData;
    };
    public visiable = 'members';

    public recurrence = [
      {
        name: '从不',
        recurrence: null,
        isSelected: false
      },
      {
        name: '每天',
        recurrence: 'RRULE:FREQ=DAILY;INTERVAL=1',
        isSelected: false
      },
      {
        name: '每周',
        recurrence: 'RRULE:FREQ=WEEKLY;INTERVAL=1',
        isSelected: false
      },
      {
        name: '每两周',
        recurrence: 'RRULE:FREQ=WEEKLY;INTERVAL=2',
        isSelected: false
      },
      {
        name: '每月',
        recurrence: 'RRULE:FREQ=MONTHLY;INTERVAL=1',
        isSelected: false
      }
    ];

    public recurrenceName: string;

    private state: string;
    private projectId: string;
    private DetailAPI: IDetailAPI;
    private MemberAPI: IMemberAPI;
    private lastRecurrneceIndex: number;
    private Rrule: IRrule;

    // @ngInject
    constructor(
      $scope: angular.IScope
    ) {
      super();
      this.$scope = $scope;
      this.startDate = new Date();
      this.endDate = new Date(Date.now() + 3600000);
      this.state = 'origin';
      this.zone.run(() => {
        this.projectId = this.$state.params._id;
      });
    }

    public onInit() {
      return this.MemberAPI.fetch(this.projectId)
      .then((members: any) => {
        this.members = members;
      });
    }

    public onAllChangesDone() {
      let userid = this.$rootScope.userMe._id;
      this.involveMembers = [];
      this.involveMembers.push(userid);
      this.members[userid].isSelected = true;
      this.setHeader();
    }

    public openInvolve() {
      this.state = 'involve';
      this.setHeader();
      this.openModal('create/event/involve-modal.html', {
        scope: this.$scope
      });
    }

    public openNote() {
      this.openModal('create/event/content.html', {
        scope: this.$scope,
        animation: 'slide-in-left'
      });
      this.state = 'content';
      this.setHeader();
    }

    public openRecurrence() {
      this.openModal('create/event/recurrence.html', {
        scope: this.$scope,
        animation: 'slide-in-left'
      });
      this.state = 'recurrence';
      this.setHeader();
    }

    public getInvolveNames() {
      let names = [];
      angular.forEach(this.members, (member: IMemberData) => {
        if (member.isSelected) {
          names.push(member.name);
        }
      });
      return names.join('、');
    }

    public chooseRecurrence($index: number) {
      if (this.lastRecurrneceIndex) {
        this.recurrence[this.lastRecurrneceIndex].isSelected = false;
      }
      this.lastRecurrneceIndex = $index;
      this.recurrence[$index].isSelected = true;
      this.recurrenceStr = this.recurrence[$index].recurrence;
      this.recurrenceName = this.recurrence[$index].name;
      this.cancelModal();
      this.state = 'origin';
      this.setHeader();
    }

    private setHeader() {
      switch (this.state) {
        case 'origin':
          if (Ding) {
            Ding.setRight('确定', true, false, () => {
              this.createEvent();
              this.state = 'origin';
            });
            Ding.setLeft('取消', true, false, () => {
              window.history.back();
              this.state = 'origin';
            });
          }
          break;
        case 'involve':
          if (Ding) {
            Ding.setRight('确定', true, false, () => {
              this.selectInvolve();
              this.state = 'origin';
              this.cancelModal();
              this.setHeader();
            });
            Ding.setLeft('取消', true, false, () => {
              let id = this.$rootScope.userMe._id;
              this.involveMembers = [id];
              angular.forEach(this.members, (member: IMemberData) => {
                member.isSelected = member._id === id;
              });
              this.cancelModal();
              this.state = 'origin';
              this.setHeader();
            });
          }
          break;
        case 'content':
          if (Ding) {
            Ding.setRight('确定', true, false, () => {
              this.cancelModal();
              this.state = 'origin';
              if (!this.$scope.$$phase) {
                this.$scope.$digest();
              }
              this.setHeader();
            });
            Ding.setLeft('取消', true, false, () => {
              this.content = '';
              this.cancelModal();
              this.state = 'origin';
              this.setHeader();
            });
          }
          break;
        case 'recurrence':
          if (Ding) {
            Ding.setRight('', false, false);
            Ding.setLeft('取消', true, false, () => {
              this.recurrenceStr = null;
              this.cancelModal();
              this.state = 'origin';
              this.setHeader();
            });
          }
          break;
      }
    }

    private createEvent() {
      if (typeof this.title !== 'undefined') {
        this.showLoading();
        let nowStr = this.Rrule.timeToUntilString(Date.now());
        let recurrence = this.recurrenceStr ?
                         ['DTSTART=' + this.recurrenceStr.replace(';', `;${nowStr};`)] :
                         null;
        return this.DetailAPI.create('event', {
          _projectId: this.projectId,
          title: this.title,
          startDate: this.startDate,
          endDate: this.endDate,
          content: this.content,
          location: this.location,
          involveMembers: this.involveMembers,
          recurrence: recurrence,
          visiable: this.visiable
        })
        .then((event: IEventDataParsed) => {
          this.showMsg('success', '创建成功', '已成功创建日程', `#/detail/event/${event._id}`);
          this.hideLoading();
          window.history.back();
        })
        .catch((reason: any) => {
          let message = this.getFailureReason(reason);
          alert(JSON.stringify(reason));
          this.showMsg('error', JSON.stringify(reason), message);
          this.hideLoading();
          window.history.back();
        });
      }
    }

    private selectInvolve() {
      let involve = [];
      angular.forEach(this.members, (member: any) => {
        if (member.isSelected) {
          involve.push(member._id);
        }
      });
      this.involveMembers = involve;
      this.visiable = this.isVisiable ? 'involves' : 'members';
    }
  }

  angular.module('teambition').controller('CreateEventView', CreateEventView);
}
