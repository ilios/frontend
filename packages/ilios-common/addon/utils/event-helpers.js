import { DateTime } from 'luxon';

export function getSlugForSchoolEvent(schoolId, startDate, offeringId, ilmSessionId) {
  let slug = 'S';
  schoolId = parseInt(schoolId, 10).toString();
  //always use a two digit schoolId
  if (schoolId.length === 1) {
    schoolId = '0' + schoolId;
  }
  slug += schoolId;
  slug += DateTime.fromISO(startDate).toFormat('yyyyMMdd');
  if (offeringId) {
    slug += 'O' + offeringId;
  }
  if (ilmSessionId) {
    slug += 'I' + ilmSessionId;
  }
  return slug;
}

export function getSlugForUserEvent(startDate, offeringId, ilmSessionId) {
  let slug = 'U';
  slug += DateTime.fromISO(startDate).toFormat('yyyyMMdd');
  if (offeringId) {
    slug += 'O' + offeringId;
  }
  if (ilmSessionId) {
    slug += 'I' + ilmSessionId;
  }
  return slug;
}

export function getSlug(data) {
  return data.isUserEvent
    ? getSlugForUserEvent(data.startDate, data.offering, data.ilmSession)
    : getSlugForSchoolEvent(data.school, data.startDate, data.offering, data.ilmSession);
}
