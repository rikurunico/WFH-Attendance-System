import apiClient from './axios';

export const changePassword = async (currentPassword, newPassword, newPasswordConfirmation) => {
  const response = await apiClient.post('/change-password', {
    current_password: currentPassword,
    new_password: newPassword,
    new_password_confirmation: newPasswordConfirmation,
  });
  return response.data;
};
