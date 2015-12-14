'use strict';
import {parentView, inject} from '../../../bases/Utils';
import {View} from '../../../bases/View';
import {IFileData} from 'teambition';

@parentView('DetailView')
export class FileView extends View {

  public ViewName = 'FileView';

  public file: IFileData;

  constructor() {
    super();
    this.zone.run(angular.noop);
  }

  public onInit() {
    return this.parent.onInit();
  }

  public onAllChangesDone() {
    this.file = this.parent.detail;
  }
}
