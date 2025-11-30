import axios from 'axios';

const API_BASE = 'http://localhost:8081'; // Đổi nếu BE chạy port khác

function getAuthHeader() {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const getProfile = async () => {
  const res = await axios.get(`${API_BASE}/user-profile/myProfile`, { headers: getAuthHeader() });
  return res.data;
};

export const updateProfile = async (data) => {
  const res = await axios.put(`${API_BASE}/user-profile/myProfile-update`, data, { headers: getAuthHeader() });
  return res.data;
};

export const getVehicles = async () => {
  const res = await axios.get(`${API_BASE}/vehicles/my-vehicles`, { headers: getAuthHeader() });
  return res.data;
};

export const createVehicle = async (data) => {
  const res = await axios.post(`${API_BASE}/vehicles/createVehicle`, data, { headers: getAuthHeader() });
  return res.data;
};

export const updateVehicle = async (id, data) => {
  const res = await axios.put(`${API_BASE}/vehicles/update/${id}`, data, { headers: getAuthHeader() });
  return res.data;
};

export const deleteVehicle = async (id) => {
  await axios.delete(`${API_BASE}/vehicles/delete/${id}`, { headers: getAuthHeader() });
};
