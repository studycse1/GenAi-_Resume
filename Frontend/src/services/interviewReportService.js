import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const interviewReportService = {
  // Generate interview report
  generateReport: async (resumeFile, selfDescription, jobDescription) => {
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('selfDescription', selfDescription);
      formData.append('jobDescription', jobDescription);

      console.log('📤 Sending request to /interviewReport/generate');
      const response = await api.post('/interviewReport/generate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('📥 Response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ API Error:', error.response?.data || error.message);
      throw error.response?.data || error.message;
    }
  },

  // Get all reports for logged-in user
  getUserReports: async () => {
    try {
      const response = await api.get('/interviewReport/user-reports');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get single report by ID
  getReportById: async (reportId) => {
    try {
      const response = await api.get(`/interviewReport/${reportId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default interviewReportService;
