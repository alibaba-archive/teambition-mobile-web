/// <reference path='../interface/teambition.d.ts' />

module EtTemplate {
  'use strict';
  interface IComponentConfig {
    templateUrl: string;
    selector: string;
    lazy?: boolean;
  }

  const notPatched = ['constructor', 'zone'];

  export class ETComponent {

    public zone: Zone;
    public parentDOM: Element;
    public template: IETProto;
    public element: DocumentFragment;

    protected $rootScope: teambition.IRootScope;
    protected parentSelector: string;

    private bindedScope = false;
    private ETInstanceName: string;

    constructor() {
      this.initZone();
    }

    public update() {
      if (this.template) {
        this.template.update();
      }
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
      let template = this.get();
      this.parentDOM = document.querySelector(this.parentSelector);
      this.parentDOM.appendChild(template);
    }

    protected bindContext(scope: any) {
      if (typeof scope === 'object' && this.ETInstanceName) {
        let Constructor = teambition.$$injector.get(this.ETInstanceName);
        scope.ETtemplate = this;
        this.template = new Constructor(scope);
        let zone = teambition.rootZone.fork({
          afterTask: () => {
            this.template.update();
          }
        });
        this.zone = zone;
        this.zone.run(teambition.noop);
        this.initZone();
        this.element = this.template.get();
        this.bindedScope = true;
      }
    }

    private initZone() {
      if (this.zone) {
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
            this[val] = fakeFn;
          }
        });
        if (this.template) {
          this.template.update();
        }
      }
    }
  }

  export function Component(conf: IComponentConfig) {
    return function(target: any) {
      let template: IETProto;
      let hasInit = false;
      let proto = target.prototype;
      let targetTmp: any;
      let templateUrl = conf.templateUrl;
      let instanceName = templateUrl.split('/').join('_');
      proto.ETInstanceName = instanceName;
      proto.parentSelector = conf.selector;
      proto.parentDOM = document.querySelector(conf.selector);
      if (!conf.lazy) {
        let zone = teambition.rootZone.fork({
          beforeTask: () => {
            if (!hasInit) {
              let $$injector = teambition.$$injector;
              let ETConstructor = $$injector.get(instanceName);
              targetTmp = zone['targetTmp'];
              let instance = new ETConstructor(targetTmp);
              template = proto.template = instance;
              proto.element = template.get();
              proto.ETConstructor = ETConstructor;
              hasInit = true;
            }
          },
          afterTask: () => {
            template = targetTmp.template || template;
            if (template) {
              template.update();
            }
          }
        });
        target.prototype.zone = zone;
      }
    };
  }
}
