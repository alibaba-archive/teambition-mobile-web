'use strict';
import {parentView} from '../../../bases/Utils';
import {View} from '../../../bases/View';
import {IEntryData} from 'teambition';

@parentView('DetailView')
export class EntryView extends View {

  public ViewName = 'EntryView';

  public entry: IEntryData;

  constructor() {
    super();
    this.zone.run(angular.noop);
  }

  public onInit() {
    return this.parent.onInit();
  }

  public onAllChangesDone() {
    this.entry = this.parent.detail;
  }
}
