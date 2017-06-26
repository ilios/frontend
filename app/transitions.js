import config from './config/environment';

function getDuration(duration) {
  return config.environment === 'test' ? 0 : duration;
}

export default function(){
  this.transition(
    this.hasClass('horizontal'),
    this.toValue(true),
    this.use('toLeft', {duration: getDuration(1000)}),
    this.reverse('toRight', {duration: getDuration(1000)})
  );
  this.transition(
    this.hasClass('vertical'),
    this.toValue(true),
    this.use('toDown', {duration: getDuration(1000)}),
    this.reverse('toUp', {duration: getDuration(1000)})
  );
  this.transition(
    this.hasClass('crossFade'),
    this.toValue(true),
    this.use('crossFade', {duration: getDuration(1000)})
  );
  this.transition(
    this.toRoute(function(){
      var topRoutes = [];
      topRoutes.push('dashboard');
      topRoutes.push('courses');
      topRoutes.push('learnerGroups');
      topRoutes.push('learnerGroup');
      topRoutes.push('instructorGroups');
      topRoutes.push('instructorGroup');
      topRoutes.push('programs');
      return topRoutes.includes(this);
    }),
    this.use('crossFade', {duration: getDuration(500)})
  );
  this.transition(
    this.fromRoute('course.index', 'session.index'),
    this.toRoute('session.index', 'session.publicationCheck'),
    this.use('toLeft', {duration: getDuration(1000)}),
    this.reverse('toRight', {duration: getDuration(1000)})
  );
}
