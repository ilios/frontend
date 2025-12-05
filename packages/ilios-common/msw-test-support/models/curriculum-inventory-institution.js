import { primaryKey, oneOf } from '@msw/data';

let idCounter = 1;

export default {
  id: primaryKey(() => String(idCounter++)),
  name: String,
  aamcCode: String,
  addressStreet: String,
  addressCity: String,
  addressStateOrProvince: String,
  addressZipcode: String,
  addressCountryCode: String,
  school: oneOf('school'),
};
