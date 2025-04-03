import axios from 'axios';

const BASE_URL = 'http://localhost:5001/api/posts';

// Get all tasks/posts
export const getTasks = async () => {
  try {
    const response = await axios.get(BASE_URL, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

// Create a new task/post
export const createTask = async (taskData) => {
  try {
    const response = await axios.post(BASE_URL, taskData, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

// Get task/post by ID
export const getTaskById = async (taskId) => {
  try {
    const response = await axios.get(`${BASE_URL}/${taskId}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Error fetching task:', error);
    throw error;
  }
};