export const fetchDepartments = async () => {
  // Simulate an API call
  const response = await new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { name: 'Information and Technology', color: '#F0F0FF' },
        { name: 'Civil Engineering', color: '#6B4EFF' },
        { name: 'Electrical Engineering', color: '#F0F0FF' },
        { name: 'Electronic & Communication', color: '#6B4EFF' },
      ]);
    }, 1000);
  });
  return response;
};