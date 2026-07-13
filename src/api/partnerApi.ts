import api from './axiosInstance';
import { PartnerApplicationRequest, PartnerProfileResponse } from '../types/partner';

export const getMyPartnerApplication = async (): Promise<PartnerProfileResponse> => {
  const res = await api.get('/api/v1/partner-applications/me');
  return res.data.data;
};

export const createPartnerApplication = async (
  payload: PartnerApplicationRequest,
): Promise<PartnerProfileResponse> => {
  const res = await api.post('/api/v1/partner-applications', payload);
  return res.data.data;
};

export const updatePartnerApplication = async (
  payload: PartnerApplicationRequest,
): Promise<PartnerProfileResponse> => {
  const res = await api.patch('/api/v1/partner-applications/me', payload);
  return res.data.data;
};

export const deletePartnerApplication = async (): Promise<void> => {
  await api.delete('/api/v1/partner-applications/me');
};

export const getBusinessRegistrationPresignedUrl = async (
  fileName: string,
): Promise<{ presignedUrl: string; fileUrl: string }> => {
  const res = await api.post('/api/v1/presigned-url', {
    folder: 'BUSINESS_REGISTRATION',
    fileNames: [fileName],
  });
  return res.data.data.urls[0];
};
