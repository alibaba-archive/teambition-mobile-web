'use strict';
import {inject} from '../../../../bases/Utils';
import {View} from '../../../../bases/View';
import {DetailAPI} from '../../../../services/service';
import {ITaskData} from 'teambition';

@inject([
  'DetailAPI',
  '$filter'
])
export class EditRecurrenceView extends View {
  public ViewName = 'EditRecurrenceView';

  public detail: any;
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

  private DetailAPI: DetailAPI;
  private boundToObjectId: string;
  private boundToObjectType: string;
  private lastIndex: number;
  private $filter: any;
  constructor() {
    super();
    this.zone.run(() => {
      this.boundToObjectId = this.$state.params._id;
      this.boundToObjectType = this.$state.params.type;
    });
  }

  public onInit() {
    return this.DetailAPI.fetch(this.boundToObjectId, this.boundToObjectType)
    .then((task: ITaskData) => {
      this.detail = task;
      if (!this.detail.recurrence) {
        this.recurrence[0].isSelected = true;
        this.lastIndex = 0;
      }else {
        for (let index = 1; index < this.recurrence.length; index++) {
          let element = this.recurrence[index];
          let parsedRecurrence = this.$filter('recurrenceStr')(this.detail.recurrenceTime);
          if (element.name === parsedRecurrence) {
            element.isSelected = true;
            this.lastIndex = index;
          }
        }
      }
    });
  }

  public chooseRecurrence($index: number) {
    this.showLoading();
    return this.DetailAPI.update(this.boundToObjectId, this.boundToObjectType, {
      recurrence: [this.recurrence[$index].recurrence]
    })
    .then(() => {
      this.recurrence[this.lastIndex].isSelected = false;
      this.recurrence[$index].isSelected = true;
      this.lastIndex = $index;
      this.showMsg('success', '更新成功', '已更新任务重复规则');
      this.hideLoading();
      window.history.back();
    })
    .catch((reason: any) => {
      let message = this.getFailureReason(reason);
      this.showMsg('error', '更新失败', message);
      this.hideLoading();
      window.history.back();
    });
  }
}

angular.module('teambition').controller('EditRecurrenceView', EditRecurrenceView);
