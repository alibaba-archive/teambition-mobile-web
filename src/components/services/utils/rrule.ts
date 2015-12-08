'use strict';

export const Rrule = {
  timeToUntilString: (time: any) => {
    let date = new Date(time);
    let comp, comps = [
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      date.getUTCDate(),
      'T',
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      'Z'
    ];
    for (let i = 0; i < comps.length; i++) {
      comp = comps[i];
      if (!/[TZ]/.test(comp) && comp < 10) {
          comps[i] = '0' + String(comp);
      }
    }
    return comps.join('');
  },
  untilStringToDate: (until: any) => {
    let re = /^(\d{4})(\d{2})(\d{2})(T(\d{2})(\d{2})(\d{2})Z)?$/;
    let bits: any = re.exec(until);
    if (!bits) {
      return null;
    }
    return new Date(
      Date.UTC(
        bits[1],
        bits[2] - 1,
        bits[3],
        bits[5] || 0,
        bits[6] || 0,
        bits[7] || 0
      )
    );
  }
};
