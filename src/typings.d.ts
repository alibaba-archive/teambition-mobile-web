/// <reference path="../tools/typings/teambition.d.ts" />
/// <reference path="../tools/typings/et.d.ts" />

declare module 'Spiderjs'{
  export = Spiderjs;
}

declare class Spiderjs {
  constructor(opts: {
    _userId: string;
    client: string;
    host: string;
  });
}

declare module 'snapper-consumer' {
  export = Consumer;
}

declare class Consumer {
  constructor();
  _join(_id: string, consumerId: string): void;
  join(id: string): void;
  onmessage(event: any, callback: Function): void;
}
