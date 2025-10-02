export const checkUserExist = (user: any) => {
  if (user) {
    const error: any = new Error(
      "This phone number has already been registered."
    );
    error.status = 400;
    error.code = "Error_AlreadyExists";
    throw error;
  }
};
