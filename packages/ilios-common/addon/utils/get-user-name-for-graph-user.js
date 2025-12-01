export default function getUserNameForGraphUser(user) {
  if (user.displayName) {
    return user.displayName;
  }
  const middleInitial = user.middleName ? user.middleName.charAt(0) : false;
  if (middleInitial) {
    return `${user.firstName} ${middleInitial}. ${user.lastName}`;
  } else {
    return `${user.firstName} ${user.lastName}`;
  }
}
