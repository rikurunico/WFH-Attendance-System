import apiClient from './axios';

export const addTasks = async (attendanceId, tasks) => {
  const response = await apiClient.post('/tasks/add', {
    attendance_id: attendanceId,
    tasks,
  });
  return response.data;
};

export const getIncompleteTasks = async () => {
  const response = await apiClient.get('/tasks/incomplete');
  return response.data;
};
