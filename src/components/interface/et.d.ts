/// <reference path='../libs/ETComponents.ts' />
/// <reference path='../et/notify/notify.ts' />
/// <reference path='../et/task-filter/task-filter.ts' />
/// <reference path='../et/input/input.ts' />

declare module EtTemplate {

  interface IParamData {
    [index: string]: any;
  }

  interface IUpdateParam {
    scope?: IParamData;
    [index: string]: any;
  }

  export interface IETProto {
    update(): void;
    get(): DocumentFragment;
    remove(): void;
    destroy(): void;
  }
}
