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
      this.parentDOM.appendChild(this.template.get());
    }
  }

  export function Component(conf: IComponentConfig) {
    return function(target: any) {
      let hasInit = false;
      let template: IETProto;
      let proto = target.prototype;
      let patched = false;
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
          if (!patched) {
            let keys = Object.keys(proto);
            angular.forEach(keys, (val: string) => {
              if (typeof proto[val] === 'function') {
                let originFn = proto[val];
                let fakeFn = (...args: any[]) => {
                  let val: any;
                  proto.zone.run(() => {
                    val = originFn.apply(proto, args);
                  });
                  return val;
                };
                proto[val] = fakeFn;
              }
              patched = true;
            });
          }
          if (template && proto) {
            template.update(proto);
          }
        }
      });
      target.prototype.zone = zone;
    };
  }
}
