'use strict';
import {View, parentView} from '../../index';
import {IEntryData} from 'teambition';

@parentView('DetailView')
export class EntryView extends View {

  public entry: IEntryData;

  public onInit() {
    return this.parent.onInit();
  }

  public onAllChangesDone() {
    this.entry = this.parent.detail;
  }
}

angular.module('teambition').controller('EntryView', EntryView);
