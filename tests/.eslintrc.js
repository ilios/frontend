module.exports = {
  "globals": {
    "$": true,
    "getElementText": true,
    "getText": true,
    "pickOption": true,
    "select": true,
    "server": true,
    // embertest ENV globals manually added since we're not supporting andThen anymore
		"click": true,
		"currentPath": true,
		"currentRouteName": true,
		"currentURL": true,
		"fillIn": true,
		"find": true,
		"findWithAssert": true,
		"keyEvent": true,
		"pauseTest": true,
		"resumeTest": true,
		"triggerEvent": true,
		"visit": true
  },
};
