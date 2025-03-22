let enrolledModules = [];

export const enrollModule = async (enrollmentKey) => {
  // Mock API response
  const validEnrollmentKey = "12345"; // Example valid enrollment key

  if (enrollmentKey === validEnrollmentKey) {
    const module = {
      code: 'CTE-411',
      name: 'Artificial Intelligence',
      instructor: 'Mr. Manoj Chhetri',
      progress: '25%',
      totalClasses: 12,
    };
    enrolledModules.push(module);
    return { success: true, message: "Enrollment successful" };
  } else {
    return { success: false, message: "Invalid enrollment key" };
  }
};

export const getEnrolledModules = async () => {
  return enrolledModules;
};

export const isModuleEnrolled = async (code) => {
  return enrolledModules.some(module => module.code === code);
};