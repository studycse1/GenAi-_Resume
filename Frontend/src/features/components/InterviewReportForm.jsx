import React, { useState } from 'react';
import interviewReportService from '../../services/interviewReportService';
import '../../styles/InterviewReport.css';

const InterviewReportForm = ({ onReportGenerated }) => {
  const [formData, setFormData] = useState({
    resume: null,
    jobDescription: '',
    selfDescription: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef(null);

  const validateFile = (file) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const fileExtension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      setError('Please upload a PDF, DOC, or DOCX file');
      return false;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return false;
    }

    return true;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (validateFile(file)) {
        setFormData({ ...formData, resume: file });
        setFileName(file.name);
        setError('');
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (loading) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      if (validateFile(file)) {
        setFormData({ ...formData, resume: file });
        setFileName(file.name);
        setError('');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleWrapperClick = () => {
    if (!loading) {
      fileInputRef.current?.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate all fields
    if (!formData.resume) {
      setError('Please upload a resume file');
      return;
    }

    if (!formData.jobDescription.trim()) {
      setError('Please enter job description');
      return;
    }

    if (!formData.selfDescription.trim()) {
      setError('Please enter your self description');
      return;
    }

    try {
      setLoading(true);
      const result = await interviewReportService.generateReport(
        formData.resume,
        formData.selfDescription,
        formData.jobDescription
      );

      console.log('✅ Full Response:', result);

      // Reset form
      setFormData({
        resume: null,
        jobDescription: '',
        selfDescription: '',
      });
      setFileName('');

      // Call parent callback
      if (onReportGenerated) {
        onReportGenerated(result.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate report. Please try again.');
      console.error('❌ Error generating report:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container" id="report-generator-container">
      <h2>Generate Interview Report</h2>
      <form onSubmit={handleSubmit} className="report-form" id="generator-form">
        {error && <div className="error-message" id="form-error-banner">{error}</div>}

        {/* Resume Upload Drag & Drop Zone */}
        <div className="form-group">
          <label htmlFor="resume">Upload Resume *</label>
          <div 
            className={`file-input-wrapper ${isDragging ? 'dragging' : ''} ${fileName ? 'has-file' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleWrapperClick}
            id="drag-drop-zone"
          >
            <input
              ref={fileInputRef}
              type="file"
              id="resume"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              disabled={loading}
              className="file-input"
            />
            <div className="upload-zone-content">
              <span className="upload-icon">
                {fileName ? '📄' : '📤'}
              </span>
              <div className="upload-text-block">
                <span className="file-select-btn-text">
                  {fileName ? 'Change Resume' : 'Drag & drop or click to upload'}
                </span>
                <span className="file-name">{fileName || 'Supports PDF, DOC, DOCX up to 5MB'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div className="form-group">
          <label htmlFor="jobDescription">Job Description *</label>
          <textarea
            id="jobDescription"
            name="jobDescription"
            value={formData.jobDescription}
            onChange={handleInputChange}
            placeholder="Paste the job description here..."
            rows="5"
            disabled={loading}
          />
        </div>

        {/* Self Description */}
        <div className="form-group">
          <label htmlFor="selfDescription">Self Description *</label>
          <textarea
            id="selfDescription"
            name="selfDescription"
            value={formData.selfDescription}
            onChange={handleInputChange}
            placeholder="Describe your experience, skills, and why you're interested in this role..."
            rows="5"
            disabled={loading}
          />
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          className="submit-btn" 
          disabled={loading}
          id="btn-submit-form"
        >
          {loading ? (
            <div className="loader-container">
              <span className="loader-spinner"></span>
              <span>Analyzing Resume & Generating Report...</span>
            </div>
          ) : 'Generate Report'}
        </button>
      </form>
    </div>
  );
};

export default InterviewReportForm;
