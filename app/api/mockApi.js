export const fetchRoute = (userType) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (userType === 'hod') {
        resolve('/home');
      } else if (userType === 'student') {
        resolve('/(students)/student');
      } else if (userType === 'tutor') {
        resolve('/(tutor)/tutor'); // Route for Tutor
      } else {
        resolve('/');
      }
    }, 500);
  });
};

export const fetchDepartmentRoute = (userType) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (userType === 'hod') {
        resolve('/department/[name]');
      } else if (userType === 'student') {
        resolve('/department/[name]');
      } else {
        resolve('/');
      }
    }, 500);
  });
};