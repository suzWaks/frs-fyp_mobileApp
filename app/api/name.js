export const fetchYears = async () => {
  // Simulate an API call
  const response = await new Promise((resolve) => {
    setTimeout(() => {
      resolve(["First Year", "Second Year", "Third Year", "Fourth Year"]);
    }, 1000);
  });
  return response;
};