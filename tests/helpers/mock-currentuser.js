import { defineFixture } from 'ic-ajax';
export default function mockUser(userId) {
  defineFixture('/api/currentsession', {
    response: {currentsession: {userId: userId}},
    jqXHR: {},
    textStatus: 'success'
  });
}
