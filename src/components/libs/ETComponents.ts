/// <reference path='../interface/teambition.d.ts' />

module EtTemplate {
  'use strict';
  interface IComponentConfig {
    templateUrl: string;
    selector: string;
  }

  const notPatched = ['constructor', 'zone'];

  export class ETComponent {

    public zone: Zone;
    public parentDOM: Element;
    public template: IETProto;

    constructor() {
      let keys = Object.keys(Object.getPrototypeOf(this));
      this.zone['targetTmp'] = this;
      angular.forEach(keys, (val: string) => {
        if (typeof this[val] === 'function' && notPatched.indexOf(val) === -1) {
          let originFn = this[val];
          let fakeFn = (...args: any[]) => {
            let val: any;
            this.zone.run(() => {
              val = originFn.apply(this, args);
            });
            return val;
          };
          this[val] = fakeFn.bind(this);
        }
      });
      if (this.template) {
        this.template.update(this);
      }
    }

    public update() {
      this.template.update(this);
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
      this.parentDOM.appendChild(this.get());
    }
  }

  export function Component(conf: IComponentConfig) {
    return function(target: any) {
      let template: IETProto;
      let hasInit = false;
      let proto = target.prototype;
      let zone = teambition.rootZone.fork({
        beforeTask: () => {
          let $$injector = teambition.$$injector;
          if (!hasInit) {
            let templateUrl = conf.templateUrl;
            let instanceName = templateUrl.split('/').join('_');
            let instance = new $$injector.get(instanceName)(proto);
            template = proto.template = instance;
            proto.parentDOM = document.querySelector(conf.selector);
          }
          hasInit = true;
        },
        afterTask: () => {
          template.update(zone['targetTmp']);
        }
      });
      target.prototype.zone = zone;
    };
  }
}
