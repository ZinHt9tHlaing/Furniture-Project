// authorize( true, user.role, "ADMIN", "AUTHOR" )
// authorize( false, user.role, "USER" )

export const authorize = (
  permission: boolean,
  userRole: string,
  ...roles: string[]
) => {
  const result = roles.includes(userRole); // true or false

  let grant = true;

  if (permission && !result) grant = false;

  if (!permission && result) grant = false;

  return grant;
};
