import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import InterviewReportForm from '../components/InterviewReportForm';
import InterviewReportDisplay from '../components/InterviewReportDisplay';
import '../../styles/Dashboard.css';
import interviewReportService from '../../services/interviewReportService';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [generatedReport, setGeneratedReport] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [userReports, setUserReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState('');

  const loadUserReports = async () => {
    try {
      setReportsLoading(true);
      setReportsError('');
      const response = await interviewReportService.getUserReports();
      const reports = Array.isArray(response?.data) ? response.data : [];
      setUserReports(reports);

      if (!generatedReport && reports.length > 0) {
        setGeneratedReport(reports[0]);
      }
    } catch (error) {
      setReportsError(error.message || 'Failed to fetch reports');
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    loadUserReports();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleReportGenerated = (report) => {
    setGeneratedReport(report);
    setIsReportModalOpen(true);
    loadUserReports();
  };

  const openReportModal = (report) => {
    setGeneratedReport(report);
    setIsReportModalOpen(true);
  };

  const closeReportModal = () => {
    setIsReportModalOpen(false);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome, {user?.username}!</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>

      <main className="dashboard-content">
        <section className="dashboard-layout">
          <div className="left-panel">
            <InterviewReportForm onReportGenerated={handleReportGenerated} />
          </div>

          <section className="reports-section right-panel">
            <div className="reports-section-header">
              <h2>Your Reports</h2>
              <p>{userReports.length} total</p>
            </div>

            {reportsLoading && <p className="reports-status">Loading reports...</p>}
            {reportsError && <p className="reports-status error">{reportsError}</p>}
            {!reportsLoading && !reportsError && userReports.length === 0 && (
              <p className="reports-status">No reports found. Generate one to see it here.</p>
            )}

            {!reportsLoading && !reportsError && userReports.length > 0 && (
              <div className="report-cards">
                {userReports.map((report) => {
                  const score = report?.interviewReport?.matchScore || report?.interviewReport?.match_score || 0;
                  const createdAt = report?.createdAt ? new Date(report.createdAt).toLocaleString() : 'Unknown date';

                  return (
                    <div className="report-card" key={report._id || createdAt}>
                      <div className="report-card-top">
                        <span className="report-score">{score}%</span>
                        <button
                          type="button"
                          className="view-report-btn"
                          onClick={() => openReportModal(report)}
                        >
                          View Report
                        </button>
                      </div>
                      <p className="report-meta">Created: {createdAt}</p>
                      <p className="report-title">{(report.jobDescription || 'Interview Report').slice(0, 120)}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </section>

        {isReportModalOpen && generatedReport && (
          <div className="report-modal-overlay" onClick={closeReportModal}>
            <div
              className="report-modal-content"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="report-modal-header">
                <h3>Interview Report</h3>
                <button
                  type="button"
                  className="report-modal-close"
                  onClick={closeReportModal}
                >
                  Close
                </button>
              </div>
              <InterviewReportDisplay report={generatedReport} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
