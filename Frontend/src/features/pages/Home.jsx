import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState(null);

  const features = [
    {
      icon: '🧠',
      title: 'AI-Powered Analysis',
      description: 'Advanced AI technology analyzes your resume for ATS compatibility and content quality',
    },
    {
      icon: '⚡',
      title: 'Instant Feedback',
      description: 'Get real-time suggestions to improve your resume formatting and content',
    },
    {
      icon: '📊',
      title: 'Detailed Score',
      description: 'Receive a comprehensive score based on multiple criteria and industry standards',
    },
    {
      icon: '🎯',
      title: 'Keyword Optimization',
      description: 'Ensure your resume contains the right keywords for your target position',
    },
  ];

  const checklist = [
    { category: 'Content', items: ['ATS parse rate', 'Grammar & spelling', 'Quantified achievements'] },
    { category: 'Format', items: ['File format', 'Resume length', 'Bullet point optimization'] },
    { category: 'Skills', items: ['Hard skills', 'Soft skills', 'Industry alignment'] },
  ];

  const testimonials = [
    {
      quote: 'This resume checker completely transformed my job application. I got 3 interviews in the first week!',
      author: 'Sarah Johnson',
      role: 'Product Manager',
    },
    {
      quote: 'The AI feedback was incredibly helpful. I made simple changes and started getting callbacks.',
      author: 'Michael Chen',
      role: 'Software Engineer',
    },
    {
      quote: 'Best resume tool I have used. The ATS compatibility check is a game-changer.',
      author: 'Emily Rodriguez',
      role: 'Data Scientist',
    },
  ];

  const faqs = [
    {
      question: 'What is a resume checker?',
      answer: 'A resume checker uses AI to evaluate your resume for ATS compatibility, formatting, content quality, and provides actionable feedback for improvement.'
    },
    {
      question: 'How long does analysis take?',
      answer: 'Analysis is instant! Upload your resume and get your score and detailed feedback within seconds.'
    },
    {
      question: 'Is my resume data secure?',
      answer: 'Yes, we prioritize your privacy. Your resume data is encrypted and never shared with third parties.'
    },
    {
      question: 'What file formats are supported?',
      answer: 'We support PDF and DOCX formats. Maximum file size is 2MB.'
    }
  ];

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="home animate-fade-in">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-grid-bg"></div>
        <div className="hero-content animate-slide-up">
          <div className="hero-badge">✨ Next-Generation AI Resume Scanner</div>
          <h1>Is Your Resume Ready for Success?</h1>
          <p>Get AI-powered resume analysis and instant feedback to land your dream job</p>
          <div className="cta-wrapper">
            <button 
              type="button"
              className="cta-button"
              onClick={() => navigate('/login')}
              id="hero-cta-btn"
            >
              Start Analyzing Your Resume
            </button>
          </div>
        </div>
        <div className="hero-stats animate-slide-up">
          <div className="stat">
            <h3>10K+</h3>
            <p>Resumes Analyzed</p>
          </div>
          <div className="stat-divider"></div>
          <div className="stat">
            <h3>94%</h3>
            <p>Success Rate</p>
          </div>
          <div className="stat-divider"></div>
          <div className="stat">
            <h3>4.9/5</h3>
            <p>User Rating</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="section-header">
          <h2>Why Choose Our Resume Checker?</h2>
          <p>Supercharge your job application with intelligent automation</p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Four simple steps to transform your career application</p>
        </div>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Upload Resume</h3>
            <p>Share your resume in PDF or DOCX format</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>AI Analysis</h3>
            <p>Our AI analyzes for ATS compatibility and content</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Get Score</h3>
            <p>Receive detailed score and recommendations</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Improve</h3>
            <p>Implement suggestions and boost your chances</p>
          </div>
        </div>
      </section>

      {/* Resume Checklist Section */}
      <section className="checklist">
        <div className="section-header">
          <h2>Our AI Checks 16+ Crucial Elements</h2>
          <p>Get graded across formatting, vocabulary, content accuracy, and grammar</p>
        </div>
        <div className="checklist-container">
          {checklist.map((section, index) => (
            <div key={index} className="checklist-section">
              <h3>{section.category}</h3>
              <ul>
                {section.items.map((item, i) => (
                  <li key={i}>
                    <span className="check-icon">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="section-header">
          <h2>What Users Say</h2>
          <p>Hear from product managers, engineers, and designers who landed their jobs</p>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <p className="quote">"{testimonial.quote}"</p>
              <div className="testimonial-author">
                <strong>{testimonial.author}</strong>
                <span>{testimonial.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-gradient-bg"></div>
        <h2>Ready to Land Your Dream Job?</h2>
        <p>Join thousands of successful job seekers who improved their resumes with our AI</p>
        <button 
          type="button"
          className="cta-button-large"
          onClick={() => navigate('/register')}
          id="cta-large-btn"
        >
          Get Your Resume Score Now
        </button>
        <p className="privacy-text">✓ Privacy guaranteed • No credit card required</p>
      </section>

      {/* FAQ Section */}
      <section className="faq">
        <div className="section-header">
          <h2>Frequently Asked Questions</h2>
          <p>Got questions? We've got answers.</p>
        </div>
        <div className="faq-accordion">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div 
                key={index} 
                className={`faq-item ${isOpen ? 'active' : ''}`}
                onClick={() => toggleFaq(index)}
              >
                <div className="faq-question">
                  <h3>{faq.question}</h3>
                  <span className="faq-toggle-icon">
                    {isOpen ? '−' : '+'}
                  </span>
                </div>
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Home;
