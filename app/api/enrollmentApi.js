export const enrollModule = async (enrollmentKey) => {
  // Mock API response
  const validEnrollmentKey = "12345"; // Example valid enrollment key

  if (enrollmentKey === validEnrollmentKey) {
    return { success: true, message: "Enrollment successful" };
  } else {
    return { success: false, message: "Invalid enrollment key" };
  }
};