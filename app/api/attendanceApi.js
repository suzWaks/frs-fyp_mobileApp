export const sendAttendanceData = async (userRole, selectedMode) => {
  // Mock API URL
  const apiUrl = 'https://mockapi.example.com/attendance';

  // Data to be sent to the mock API
  const data = {
    userRole,
    selectedMode,
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      return { success: true, message: 'Data sent successfully' };
    } else {
      return { success: false, message: 'Failed to send data' };
    }
  } catch (error) {
    return { success: false, message: `Error: ${error.message}` };
  }
};