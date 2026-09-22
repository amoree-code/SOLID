import { httpClient } from './http-client';

export type UploadedFile = {
  id: string;
  url: string;
};

export async function uploadFile(file: File): Promise<UploadedFile> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await httpClient.post<UploadedFile>('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
}
