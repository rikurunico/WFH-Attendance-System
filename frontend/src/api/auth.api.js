import apiClient from './axios';

export const login = async (email, password, captchaToken) => {
  console.log('API login request:', {
    email,
    passwordLength: password?.length || 0,
    captchaTokenLength: captchaToken?.length || 0
  });
  const response = await apiClient.post('/auth/login', { email, password, captcha_token: captchaToken });
  return response.data;
};

export const logout = async () => {
  const response = await apiClient.post('/auth/logout');
  return response.data;
};

export const register = async (data) => {
  const response = await apiClient.post('/auth/register', data);
  return response.data;
};

export const getRegistrationStatus = async () => {
  const response = await apiClient.get('/auth/registration-status');
  return response.data;
};
