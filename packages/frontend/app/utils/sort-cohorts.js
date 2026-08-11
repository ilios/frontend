import { sortBy } from 'ilios-common/utils/array-helpers';

export default async function sortCohorts(cohorts) {
  const sortProxies = await Promise.all(
    cohorts.map(async (cohort) => {
      const programYear = await cohort.programYear;
      const program = await programYear.program;
      const school = await program.school;
      return {
        cohort,
        cohortTitle: cohort.title,
        programTitle: program.title,
        schoolTitle: school.title,
      };
    }),
  );
  return sortBy(sortProxies, ['schoolTitle', 'programTitle', 'cohortTitle']).map(
    (sortedProxy) => sortedProxy.cohort,
  );
}
