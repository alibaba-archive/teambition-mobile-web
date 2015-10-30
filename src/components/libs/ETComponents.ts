/// <reference path='../interface/teambition.d.ts' />

module EtTemplate {
  'use strict';
  interface IComponentConfig {
    templateUrl: string;
    selector: string;
  }

  export class ETComponent {

    public zone: Zone;
    public parentDOM: Element;
    public template: IETProto;

    constructor() {
      this.zone.run(teambition.noop);
    }

    public update(data: IUpdateParam) {
      this.template.update(data);
    }

    public destroy() {
      this.template.destroy();
    }

    public remove() {
      this.template.remove();
    }

    public get() {
      return this.template.get();
    }

    protected insertDOM() {
      this.parentDOM.appendChild(this.template.get());
    }
  }

  export function Component(conf: IComponentConfig) {
    return function(target: any) {
      let hasInit = false;
      let zone = teambition.rootZone.fork({
        beforeTask: () => {
          let $$injector = teambition.$$injector;
          if (!hasInit) {
            let templateUrl = conf.templateUrl;
            let instanceName = templateUrl.split('/').join('_');
            let instance = new $$injector.get(instanceName)();
            target.prototype.template = instance;
            target.prototype.parentDOM = document.querySelector(conf.selector);
          }
          hasInit = true;
        }
      });
      target.prototype.zone = zone;
    };
  }
}
