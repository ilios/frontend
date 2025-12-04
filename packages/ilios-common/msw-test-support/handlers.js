import { genericHandlers } from './handlers/generic-crud.js';
import { specialCaseHandlers } from './handlers/special-cases.js';

// MSW request handlers
// Special case handlers MUST come first - MSW uses the first matching handler
export const handlers = [...specialCaseHandlers, ...genericHandlers];

export default handlers;
