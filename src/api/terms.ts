import api from './axiosInstance';

export const getAgreeTerms = async (): Promise<boolean> => {
  const res = await api.get('/api/v1/auth/agree-terms');
  return res.data.data;
};

export const postAgreeTerms = async (): Promise<void> => {
  await api.post('/api/v1/auth/agree-terms');
};
