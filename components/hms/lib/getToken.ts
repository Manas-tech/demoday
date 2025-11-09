export const getToken = async (role: string, room_id: string): Promise<string> => {
  const response = await fetch('/api/hms-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      role,
      room_id
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Token generation error:', {
      status: response.status,
      statusText: response.statusText,
      errorData,
      requestData: { role, room_id }
    });
    throw new Error(`Failed to generate token: ${response.statusText} - ${errorData}`);
  }

  const data = await response.json();
  
  // Handle both response formats
  if (typeof data === 'string') {
    return data;
  }

  const { token, msg = 'token generated successfully', status = 200, success = true, api_version = '2.65.0' } = data;
  
  if (!success || status !== 200) {
    throw new Error(`Token generation failed: ${msg}`);
  }

  return token;
};
