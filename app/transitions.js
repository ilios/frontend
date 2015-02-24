import Ember from 'ember';

export default function(){
  this.transition(
    this.toRoute(function(){
      var topRoutes = Ember.A();
      topRoutes.push('dashboard');
      topRoutes.push('courses');
      topRoutes.push('course');
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
    this.fromRoute('course.index'),
    this.toRoute('course.session'),
    this.use('toRight'),
    this.reverse('toLeft')
  );
}
