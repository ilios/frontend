export default function() {
  this.get('/courses/:id');
  this.get('/offerings/:id');
  this.get('/sessions/:id');
  this.get('/sessiontypes/:id', 'sessionType');
  this.get('/sessiondescriptions/:id', 'sessionDescription');
}
