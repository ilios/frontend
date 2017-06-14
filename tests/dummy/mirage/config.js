import moment from 'moment';

export default function() {
  this.get('/offerings');
  this.get('/offerings/:id');
  this.get('/sessions');
  this.get('/sessions/:id');
  this.get('/users/:id');
  this.get('/userevents/:userid', function(schema, request) {
    let from = moment.unix(request.queryParams.from);
    let to = moment.unix(request.queryParams.to);
    let userid = parseInt(request.params.userid);

    const allEvents = schema.userEvents.all();
    return allEvents.filter(event => {
      return (
        parseInt(event.userId) === userid &&
        (from.isSame(event.startDate) || from.isBefore(event.startDate)) &&
        (to.isSame(event.endDate) || to.isAfter(event.endDate))
      );
    });
  });
}
