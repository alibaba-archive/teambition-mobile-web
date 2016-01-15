'use strict';
import {parentView, View} from '../../index';
import {IFileData} from 'teambition';

@parentView('DetailView')
class FileView extends View {

  public ViewName = 'FileView';

  public file: IFileData;

  public clicked = false;

  constructor() {
    super();
    this.zone.run(angular.noop);
  }

  public onAllChangesDone() {
    this.file = this.parent.detail;
  }

  public download() {
    this.clicked = true;
  }
}

angular.module('teambition').controller('FileView', FileView);
