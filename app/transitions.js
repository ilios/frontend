export default function(){
  this.transition(
    this.hasClass('horizontal'),
    this.toModel(true),
    this.use('toLeft', {duration: 1000}),
    this.reverse('toRight', {duration: 1000})
  );
  this.transition(
    this.hasClass('vertical'),
    this.toModel(true),
    this.use('toDown', {duration: 1000}),
    this.reverse('toUp', {duration: 1000})
  );
  this.transition(
    this.hasClass('crossFade'),
    this.toModel(true),
    this.use('crossFade', {duration: 1000})
  );
  this.transition(
    this.toRoute(function(){
      var topRoutes = [];
      topRoutes.push('dashboard');
      topRoutes.push('courses');
      topRoutes.push('learnergroups');
      topRoutes.push('learnergroup');
      topRoutes.push('instructorgroups');
      topRoutes.push('instructorgroup');
      topRoutes.push('programs');
      return topRoutes.contains(this);
    }),
    this.use('crossFade')
  );
  this.transition(
    this.fromRoute('course.index', 'session.index'),
    this.toRoute('session.index', 'session.publicationcheck'),
    this.use('toLeft', {duration: 1000}),
    this.reverse('toRight', {duration: 1000})
  );
}
