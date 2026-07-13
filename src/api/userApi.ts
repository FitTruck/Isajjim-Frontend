import api from './axiosInstance';

export type UserRole = 'USER' | 'PARTNER' | 'ADMIN';

export const getMyRole = async (): Promise<UserRole> => {
  const res = await api.get('/api/v1/users/role');
  return res.data.data.role;
};
