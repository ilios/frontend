// Model relations extracted during conversion
export const modelRelations = {
  'aamc-method': [
    {
      field: 'sessionTypes',
      type: 'manyOf',
      target: 'sessionType',
    },
  ],
  'aamc-pcrs': [
    {
      field: 'competencies',
      type: 'manyOf',
      target: 'competency',
    },
  ],
  'aamc-resource-type': [],
  'academic-year': [],
  'assessment-option': [],
  authentication: [
    {
      field: 'user',
      type: 'oneOf',
      target: 'user',
    },
  ],
  cohort: [
    {
      field: 'programYear',
      type: 'oneOf',
      target: 'programYear',
    },
    {
      field: 'courses',
      type: 'manyOf',
      target: 'course',
    },
    {
      field: 'learnerGroups',
      type: 'manyOf',
      target: 'learnerGroup',
    },
    {
      field: 'users',
      type: 'manyOf',
      target: 'user',
    },
  ],
  competency: [
    {
      field: 'school',
      type: 'oneOf',
      target: 'school',
    },
    {
      field: 'parent',
      type: 'oneOf',
      target: 'competency',
    },
    {
      field: 'children',
      type: 'manyOf',
      target: 'competency',
    },
    {
      field: 'aamcPcrses',
      type: 'manyOf',
      target: 'aamcPcrs',
    },
    {
      field: 'programYears',
      type: 'manyOf',
      target: 'programYear',
    },
    {
      field: 'programYearObjectives',
      type: 'manyOf',
      target: 'programYearObjective',
    },
  ],
  'course-clerkship-type': [
    {
      field: 'courses',
      type: 'manyOf',
      target: 'course',
    },
  ],
  'course-learning-material': [
    {
      field: 'course',
      type: 'oneOf',
      target: 'course',
    },
    {
      field: 'learningMaterial',
      type: 'oneOf',
      target: 'learningMaterial',
    },
    {
      field: 'meshDescriptors',
      type: 'manyOf',
      target: 'meshDescriptor',
    },
  ],
  'course-objective': [
    {
      field: 'course',
      type: 'oneOf',
      target: 'course',
    },
    {
      field: 'ancestor',
      type: 'oneOf',
      target: 'courseObjective',
    },
    {
      field: 'descendants',
      type: 'manyOf',
      target: 'courseObjective',
    },
    {
      field: 'meshDescriptors',
      type: 'manyOf',
      target: 'meshDescriptor',
    },
    {
      field: 'terms',
      type: 'manyOf',
      target: 'term',
    },
    {
      field: 'programYearObjectives',
      type: 'manyOf',
      target: 'programYearObjective',
    },
  ],
  course: [
    {
      field: 'clerkshipType',
      type: 'oneOf',
      target: 'courseClerkshipType',
    },
    {
      field: 'school',
      type: 'oneOf',
      target: 'school',
    },
    {
      field: 'directors',
      type: 'manyOf',
      target: 'user',
    },
    {
      field: 'administrators',
      type: 'manyOf',
      target: 'user',
    },
    {
      field: 'studentAdvisors',
      type: 'manyOf',
      target: 'user',
    },
    {
      field: 'cohorts',
      type: 'manyOf',
      target: 'cohort',
    },
    {
      field: 'courseObjectives',
      type: 'manyOf',
      target: 'courseObjective',
    },
    {
      field: 'meshDescriptors',
      type: 'manyOf',
      target: 'meshDescriptor',
    },
    {
      field: 'learningMaterials',
      type: 'manyOf',
      target: 'courseLearningMaterial',
    },
    {
      field: 'sessions',
      type: 'manyOf',
      target: 'session',
    },
    {
      field: 'ancestor',
      type: 'oneOf',
      target: 'course',
    },
    {
      field: 'descendants',
      type: 'manyOf',
      target: 'course',
    },
    {
      field: 'terms',
      type: 'manyOf',
      target: 'term',
    },
  ],
  'curriculum-inventory-academic-level': [
    {
      field: 'report',
      type: 'oneOf',
      target: 'curriculumInventoryReport',
    },
    {
      field: 'startingSequenceBlocks',
      type: 'manyOf',
      target: 'curriculumInventorySequenceBlock',
    },
    {
      field: 'endingSequenceBlocks',
      type: 'manyOf',
      target: 'curriculumInventorySequenceBlock',
    },
  ],
  'curriculum-inventory-export': [
    {
      field: 'report',
      type: 'oneOf',
      target: 'curriculumInventoryReport',
    },
    {
      field: 'createdBy',
      type: 'oneOf',
      target: 'user',
    },
  ],
  'curriculum-inventory-institution': [
    {
      field: 'school',
      type: 'oneOf',
      target: 'school',
    },
  ],
  'curriculum-inventory-report': [
    {
      field: 'export',
      type: 'oneOf',
      target: 'curriculumInventoryExport',
    },
    {
      field: 'sequence',
      type: 'oneOf',
      target: 'curriculumInventorySequence',
    },
    {
      field: 'sequenceBlocks',
      type: 'manyOf',
      target: 'curriculumInventorySequenceBlock',
    },
    {
      field: 'program',
      type: 'oneOf',
      target: 'program',
    },
    {
      field: 'academicLevels',
      type: 'manyOf',
      target: 'curriculumInventoryAcademicLevel',
    },
    {
      field: 'administrators',
      type: 'manyOf',
      target: 'user',
    },
  ],
  'curriculum-inventory-sequence-block': [
    {
      field: 'startingAcademicLevel',
      type: 'oneOf',
      target: 'curriculumInventoryAcademicLevel',
    },
    {
      field: 'endingAcademicLevel',
      type: 'oneOf',
      target: 'curriculumInventoryAcademicLevel',
    },
    {
      field: 'parent',
      type: 'oneOf',
      target: 'curriculumInventorySequenceBlock',
    },
    {
      field: 'children',
      type: 'manyOf',
      target: 'curriculumInventorySequenceBlock',
    },
    {
      field: 'report',
      type: 'oneOf',
      target: 'curriculumInventoryReport',
    },
    {
      field: 'sessions',
      type: 'manyOf',
      target: 'session',
    },
    {
      field: 'excludedSessions',
      type: 'manyOf',
      target: 'session',
    },
    {
      field: 'course',
      type: 'oneOf',
      target: 'course',
    },
  ],
  'curriculum-inventory-sequence': [
    {
      field: 'report',
      type: 'oneOf',
      target: 'curriculumInventoryReport',
    },
  ],
  'ilm-session': [
    {
      field: 'session',
      type: 'oneOf',
      target: 'session',
    },
    {
      field: 'learnerGroups',
      type: 'manyOf',
      target: 'learnerGroup',
    },
    {
      field: 'instructorGroups',
      type: 'manyOf',
      target: 'instructorGroup',
    },
    {
      field: 'instructors',
      type: 'manyOf',
      target: 'user',
    },
    {
      field: 'learners',
      type: 'manyOf',
      target: 'user',
    },
  ],
  'ingestion-exception': [
    {
      field: 'user',
      type: 'oneOf',
      target: 'user',
    },
  ],
  'instructor-group': [
    {
      field: 'school',
      type: 'oneOf',
      target: 'school',
    },
    {
      field: 'learnerGroups',
      type: 'manyOf',
      target: 'learnerGroup',
    },
    {
      field: 'ilmSessions',
      type: 'manyOf',
      target: 'ilmSession',
    },
    {
      field: 'users',
      type: 'manyOf',
      target: 'user',
    },
    {
      field: 'offerings',
      type: 'manyOf',
      target: 'offering',
    },
  ],
  'learner-group': [
    {
      field: 'cohort',
      type: 'oneOf',
      target: 'cohort',
    },
    {
      field: 'parent',
      type: 'oneOf',
      target: 'learnerGroup',
    },
    {
      field: 'children',
      type: 'manyOf',
      target: 'learnerGroup',
    },
    {
      field: 'ilmSessions',
      type: 'manyOf',
      target: 'ilmSession',
    },
    {
      field: 'offerings',
      type: 'manyOf',
      target: 'offering',
    },
    {
      field: 'instructorGroups',
      type: 'manyOf',
      target: 'instructorGroup',
    },
    {
      field: 'users',
      type: 'manyOf',
      target: 'user',
    },
    {
      field: 'instructors',
      type: 'manyOf',
      target: 'user',
    },
    {
      field: 'ancestor',
      type: 'oneOf',
      target: 'learnerGroup',
    },
    {
      field: 'descendants',
      type: 'manyOf',
      target: 'learnerGroup',
    },
  ],
  'learning-material-status': [],
  'learning-material-user-role': [],
  'learning-material': [
    {
      field: 'userRole',
      type: 'oneOf',
      target: 'learningMaterialUserRole',
    },
    {
      field: 'status',
      type: 'oneOf',
      target: 'learningMaterialStatus',
    },
    {
      field: 'owningUser',
      type: 'oneOf',
      target: 'user',
    },
    {
      field: 'sessionLearningMaterials',
      type: 'manyOf',
      target: 'sessionLearningMaterial',
    },
    {
      field: 'courseLearningMaterials',
      type: 'manyOf',
      target: 'courseLearningMaterial',
    },
  ],
  'mesh-concept': [
    {
      field: 'terms',
      type: 'manyOf',
      target: 'meshTerm',
    },
    {
      field: 'descriptors',
      type: 'manyOf',
      target: 'meshDescriptor',
    },
  ],
  'mesh-descriptor': [
    {
      field: 'courses',
      type: 'manyOf',
      target: 'course',
    },
    {
      field: 'sessions',
      type: 'manyOf',
      target: 'session',
    },
    {
      field: 'concepts',
      type: 'manyOf',
      target: 'meshConcept',
    },
    {
      field: 'qualifiers',
      type: 'manyOf',
      target: 'meshQualifier',
    },
    {
      field: 'trees',
      type: 'manyOf',
      target: 'meshTree',
    },
    {
      field: 'sessionLearningMaterials',
      type: 'manyOf',
      target: 'sessionLearningMaterial',
    },
    {
      field: 'courseLearningMaterials',
      type: 'manyOf',
      target: 'courseLearningMaterial',
    },
    {
      field: 'previousIndexing',
      type: 'oneOf',
      target: 'meshPreviousIndexing',
    },
    {
      field: 'sessionObjectives',
      type: 'manyOf',
      target: 'sessionObjective',
    },
    {
      field: 'courseObjectives',
      type: 'manyOf',
      target: 'courseObjective',
    },
    {
      field: 'programYearObjectives',
      type: 'manyOf',
      target: 'programYearObjective',
    },
  ],
  'mesh-previous-indexing': [
    {
      field: 'descriptor',
      type: 'oneOf',
      target: 'meshDescriptor',
    },
  ],
  'mesh-qualifier': [
    {
      field: 'descriptors',
      type: 'manyOf',
      target: 'meshDescriptor',
    },
  ],
  'mesh-term': [
    {
      field: 'concepts',
      type: 'manyOf',
      target: 'meshConcept',
    },
  ],
  'mesh-tree': [
    {
      field: 'descriptor',
      type: 'oneOf',
      target: 'meshDescriptor',
    },
  ],
  offering: [
    {
      field: 'session',
      type: 'oneOf',
      target: 'session',
    },
    {
      field: 'learnerGroups',
      type: 'manyOf',
      target: 'learnerGroup',
    },
    {
      field: 'instructorGroups',
      type: 'manyOf',
      target: 'instructorGroup',
    },
    {
      field: 'learners',
      type: 'manyOf',
      target: 'user',
    },
    {
      field: 'instructors',
      type: 'manyOf',
      target: 'user',
    },
  ],
  'pending-user-update': [
    {
      field: 'user',
      type: 'oneOf',
      target: 'user',
    },
  ],
  'program-year-objective': [
    {
      field: 'competency',
      type: 'oneOf',
      target: 'competency',
    },
    {
      field: 'programYear',
      type: 'oneOf',
      target: 'programYear',
    },
    {
      field: 'terms',
      type: 'manyOf',
      target: 'term',
    },
    {
      field: 'meshDescriptors',
      type: 'manyOf',
      target: 'meshDescriptor',
    },
    {
      field: 'ancestor',
      type: 'oneOf',
      target: 'programYearObjective',
    },
    {
      field: 'descendants',
      type: 'manyOf',
      target: 'programYearObjective',
    },
    {
      field: 'courseObjectives',
      type: 'manyOf',
      target: 'courseObjective',
    },
  ],
  'program-year': [
    {
      field: 'program',
      type: 'oneOf',
      target: 'program',
    },
    {
      field: 'cohort',
      type: 'oneOf',
      target: 'cohort',
    },
    {
      field: 'directors',
      type: 'manyOf',
      target: 'user',
    },
    {
      field: 'competencies',
      type: 'manyOf',
      target: 'competency',
    },
    {
      field: 'programYearObjectives',
      type: 'manyOf',
      target: 'programYearObjective',
    },
    {
      field: 'terms',
      type: 'manyOf',
      target: 'term',
    },
  ],
  program: [
    {
      field: 'school',
      type: 'oneOf',
      target: 'school',
    },
    {
      field: 'programYears',
      type: 'manyOf',
      target: 'programYear',
    },
    {
      field: 'directors',
      type: 'manyOf',
      target: 'user',
    },
    {
      field: 'curriculumInventoryReports',
      type: 'manyOf',
      target: 'curriculumInventoryReport',
    },
  ],
  report: [
    {
      field: 'user',
      type: 'oneOf',
      target: 'user',
    },
    {
      field: 'school',
      type: 'oneOf',
      target: 'school',
    },
  ],
  'school-config': [
    {
      field: 'school',
      type: 'oneOf',
      target: 'school',
    },
  ],
  school: [
    {
      field: 'competencies',
      type: 'manyOf',
      target: 'competency',
    },
    {
      field: 'courses',
      type: 'manyOf',
      target: 'course',
    },
    {
      field: 'programs',
      type: 'manyOf',
      target: 'program',
    },
    {
      field: 'vocabularies',
      type: 'manyOf',
      target: 'vocabulary',
    },
    {
      field: 'instructorGroups',
      type: 'manyOf',
      target: 'instructorGroup',
    },
    {
      field: 'curriculumInventoryInstitution',
      type: 'oneOf',
      target: 'curriculumInventoryInstitution',
    },
    {
      field: 'sessionTypes',
      type: 'manyOf',
      target: 'sessionType',
    },
    {
      field: 'directors',
      type: 'manyOf',
      target: 'user',
    },
    {
      field: 'administrators',
      type: 'manyOf',
      target: 'user',
    },
    {
      field: 'configurations',
      type: 'manyOf',
      target: 'schoolConfig',
    },
  ],
  schoolevent: [],
  'session-learning-material': [
    {
      field: 'session',
      type: 'oneOf',
      target: 'session',
    },
    {
      field: 'learningMaterial',
      type: 'oneOf',
      target: 'learningMaterial',
    },
    {
      field: 'meshDescriptors',
      type: 'manyOf',
      target: 'meshDescriptor',
    },
  ],
  'session-objective': [
    {
      field: 'session',
      type: 'oneOf',
      target: 'session',
    },
    {
      field: 'terms',
      type: 'manyOf',
      target: 'term',
    },
    {
      field: 'meshDescriptors',
      type: 'manyOf',
      target: 'meshDescriptor',
    },
    {
      field: 'ancestor',
      type: 'oneOf',
      target: 'sessionObjective',
    },
    {
      field: 'descendants',
      type: 'manyOf',
      target: 'sessionObjective',
    },
    {
      field: 'courseObjectives',
      type: 'manyOf',
      target: 'courseObjective',
    },
  ],
  'session-type': [
    {
      field: 'assessmentOption',
      type: 'oneOf',
      target: 'assessmentOption',
    },
    {
      field: 'school',
      type: 'oneOf',
      target: 'school',
    },
    {
      field: 'aamcMethods',
      type: 'manyOf',
      target: 'aamcMethod',
    },
    {
      field: 'sessions',
      type: 'manyOf',
      target: 'session',
    },
  ],
  session: [
    {
      field: 'sessionType',
      type: 'oneOf',
      target: 'sessionType',
    },
    {
      field: 'course',
      type: 'oneOf',
      target: 'course',
    },
    {
      field: 'ilmSession',
      type: 'oneOf',
      target: 'ilmSession',
    },
    {
      field: 'sessionObjectives',
      type: 'manyOf',
      target: 'sessionObjective',
    },
    {
      field: 'meshDescriptors',
      type: 'manyOf',
      target: 'meshDescriptor',
    },
    {
      field: 'learningMaterials',
      type: 'manyOf',
      target: 'sessionLearningMaterial',
    },
    {
      field: 'offerings',
      type: 'manyOf',
      target: 'offering',
    },
    {
      field: 'administrators',
      type: 'manyOf',
      target: 'user',
    },
    {
      field: 'studentAdvisors',
      type: 'manyOf',
      target: 'user',
    },
    {
      field: 'postrequisite',
      type: 'oneOf',
      target: 'session',
    },
    {
      field: 'prerequisites',
      type: 'manyOf',
      target: 'session',
    },
    {
      field: 'terms',
      type: 'manyOf',
      target: 'term',
    },
  ],
  term: [
    {
      field: 'vocabulary',
      type: 'oneOf',
      target: 'vocabulary',
    },
    {
      field: 'parent',
      type: 'oneOf',
      target: 'term',
    },
    {
      field: 'children',
      type: 'manyOf',
      target: 'term',
    },
    {
      field: 'programYears',
      type: 'manyOf',
      target: 'programYear',
    },
    {
      field: 'sessions',
      type: 'manyOf',
      target: 'session',
    },
    {
      field: 'courses',
      type: 'manyOf',
      target: 'course',
    },
    {
      field: 'aamcResourceTypes',
      type: 'manyOf',
      target: 'aamcResourceType',
    },
    {
      field: 'courseObjectives',
      type: 'manyOf',
      target: 'courseObjective',
    },
    {
      field: 'programYearObjectives',
      type: 'manyOf',
      target: 'programYearObjective',
    },
    {
      field: 'sessionObjectives',
      type: 'manyOf',
      target: 'sessionObjective',
    },
  ],
  'user-role': [],
  'user-session-material-status': [
    {
      field: 'user',
      type: 'oneOf',
      target: 'user',
    },
    {
      field: 'material',
      type: 'oneOf',
      target: 'sessionLearningMaterial',
    },
  ],
  user: [
    {
      field: 'reports',
      type: 'manyOf',
      target: 'report',
    },
    {
      field: 'school',
      type: 'oneOf',
      target: 'school',
    },
    {
      field: 'authentication',
      type: 'oneOf',
      target: 'authentication',
    },
    {
      field: 'directedCourses',
      type: 'manyOf',
      target: 'course',
    },
    {
      field: 'administeredCourses',
      type: 'manyOf',
      target: 'course',
    },
    {
      field: 'studentAdvisedCourses',
      type: 'manyOf',
      target: 'course',
    },
    {
      field: 'studentAdvisedSessions',
      type: 'manyOf',
      target: 'session',
    },
    {
      field: 'learnerGroups',
      type: 'manyOf',
      target: 'learnerGroup',
    },
    {
      field: 'instructedLearnerGroups',
      type: 'manyOf',
      target: 'learnerGroup',
    },
    {
      field: 'instructorGroups',
      type: 'manyOf',
      target: 'instructorGroup',
    },
    {
      field: 'instructorIlmSessions',
      type: 'manyOf',
      target: 'ilmSession',
    },
    {
      field: 'learnerIlmSessions',
      type: 'manyOf',
      target: 'ilmSession',
    },
    {
      field: 'offerings',
      type: 'manyOf',
      target: 'offering',
    },
    {
      field: 'instructedOfferings',
      type: 'manyOf',
      target: 'offering',
    },
    {
      field: 'programYears',
      type: 'manyOf',
      target: 'programYear',
    },
    {
      field: 'roles',
      type: 'manyOf',
      target: 'userRole',
    },
    {
      field: 'directedSchools',
      type: 'manyOf',
      target: 'school',
    },
    {
      field: 'administeredSchools',
      type: 'manyOf',
      target: 'school',
    },
    {
      field: 'administeredSessions',
      type: 'manyOf',
      target: 'session',
    },
    {
      field: 'directedPrograms',
      type: 'manyOf',
      target: 'program',
    },
    {
      field: 'cohorts',
      type: 'manyOf',
      target: 'cohort',
    },
    {
      field: 'primaryCohort',
      type: 'oneOf',
      target: 'cohort',
    },
    {
      field: 'pendingUserUpdates',
      type: 'manyOf',
      target: 'pendingUserUpdate',
    },
    {
      field: 'administeredCurriculumInventoryReports',
      type: 'manyOf',
      target: 'curriculumInventoryReport',
    },
    {
      field: 'sessionMaterialStatuses',
      type: 'manyOf',
      target: 'userSessionMaterialStatus',
    },
  ],
  userevent: [],
  vocabulary: [
    {
      field: 'school',
      type: 'oneOf',
      target: 'school',
    },
    {
      field: 'terms',
      type: 'manyOf',
      target: 'term',
    },
  ],
};
