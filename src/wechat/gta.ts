import { getBrowserNameAndVersion } from '../components/services/utils/getBrowserNameAndVersion';
import { app } from '../components/config';
import { IUserMe } from 'teambition';

export function getGtaUser(userMe: IUserMe) {
  const location = userMe.locationByIP ?
      userMe.locationByIP :
      {
        city: '',
        country: '',
        region: ''
      };
  const [browserName, browserVersion] = getBrowserNameAndVersion();
  return {
    $os: navigator.platform,
    $browser: browserName,
    $current_url: window.location.href,
    $browser_version: browserVersion,
    $screen_height: window.screen.height,
    $screen_width: window.screen.width,
    mp_lib: app.PLATFORM,
    platform: 'mobile',
    userKey: userMe._id,
    created_at: userMe.created,
    userLanguage: app.LANGUAGE || navigator.language,
    env: app.ENV,
    version: app.VERSION,
    daysSinceRegistered: Math.floor(
          (Date.now() - (new Date(userMe.created)).getTime()) /
          (24 * 3600 * 1000)
        ),
    city: location.city,
    country: location.country,
    region: location.region
  };
}
