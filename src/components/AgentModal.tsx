import { useState } from 'react'
import './AgentModal.css'

interface AgentModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AgentModal({ isOpen, onClose }: AgentModalProps) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'prospects' | 'residents'>('overview')
  const [copyFeedback, setCopyFeedback] = useState(false)
  const agentPhone = '636-481-9140'

  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText(agentPhone)
      setCopyFeedback(true)
      setTimeout(() => setCopyFeedback(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-header">
          <div className="modal-icon">🤖</div>
          <h2>Casa Serena AI Agent</h2>
          <div className="call-box">
            <p className="modal-call-now">CALL NOW</p>
            <div className="phone-copy-container">
              <p className="phone-number-header">{agentPhone}</p>
              <button
                className="copy-btn"
                onClick={handleCopyPhone}
                title="Copy phone number"
                aria-label="Copy phone number to clipboard"
              >
                📋
              </button>
            </div>
            {copyFeedback && <p className="copy-feedback">✓ Copied to clipboard!</p>}
          </div>
          <p className="modal-subtitle">Intelligent voice assistant available 24/7</p>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab ${selectedTab === 'overview' ? 'active' : ''}`}
            onClick={() => setSelectedTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab ${selectedTab === 'prospects' ? 'active' : ''}`}
            onClick={() => setSelectedTab('prospects')}
          >
            For Prospective Tenants
          </button>
          <button
            className={`tab ${selectedTab === 'residents' ? 'active' : ''}`}
            onClick={() => setSelectedTab('residents')}
          >
            For Residents
          </button>
        </div>

        <div className="modal-body">
          {selectedTab === 'overview' && (
            <div className="tab-content">
              <div className="feature-group">
                <h3>What Our AI Agent Can Do</h3>
                <p className="description">
                  Our intelligent voice assistant is available to help prospective tenants and current residents with their needs. Simply call the number below and speak naturally — the agent will understand your questions and help you find answers.
                </p>

                <div className="features-grid">
                  <div className="feature-card">
                    <div className="feature-icon">🏠</div>
                    <h4>Browse Units</h4>
                    <p>Ask about available apartments and their specifications</p>
                  </div>

                  <div className="feature-card">
                    <div className="feature-icon">📅</div>
                    <h4>Schedule Tours</h4>
                    <p>Book apartment viewings at times that work for you</p>
                  </div>

                  <div className="feature-card">
                    <div className="feature-icon">❓</div>
                    <h4>Answer Questions</h4>
                    <p>Get instant answers to FAQs about policies and amenities</p>
                  </div>

                  <div className="feature-card">
                    <div className="feature-icon">🔧</div>
                    <h4>File Requests</h4>
                    <p>Residents can file maintenance requests and complaints</p>
                  </div>
                </div>
              </div>

              <div className="how-to-section">
                <h3>How It Works</h3>
                <ol className="how-to-steps">
                  <li><strong>Call the number</strong> below from any phone</li>
                  <li><strong>Speak naturally</strong> to the AI agent about your needs</li>
                  <li><strong>Get immediate responses</strong> or have requests recorded</li>
                  <li><strong>Receive confirmation</strong> of any actions (tour bookings, etc.)</li>
                </ol>
              </div>
            </div>
          )}

          {selectedTab === 'prospects' && (
            <div className="tab-content">
              <h3>What You Can Do As A Prospective Tenant</h3>
              <p className="description">
                Explore our apartments and get all the information you need to make your decision.
              </p>

              <div className="capability-section">
                <div className="capability-card">
                  <h4>🏠 Check Apartment Availability</h4>
                  <p className="capability-description">
                    Ask about available units that match your needs
                  </p>
                  <div className="example-box">
                    <strong>Try saying:</strong>
                    <ul>
                      <li>"What 2-bedroom units do you have available?"</li>
                      <li>"Show me all apartments under $1,500/month"</li>
                      <li>"Do you have any 3-bedroom units available in August?"</li>
                    </ul>
                  </div>
                </div>

                <div className="capability-card">
                  <h4>📅 Schedule a Tour</h4>
                  <p className="capability-description">
                    Book a viewing for any apartment that interests you
                  </p>
                  <div className="example-box">
                    <strong>Try saying:</strong>
                    <ul>
                      <li>"I'd like to tour unit 102"</li>
                      <li>"Can I schedule a tour tomorrow at 2 PM?"</li>
                      <li>"What times are available for a tour this weekend?"</li>
                    </ul>
                  </div>
                </div>

                <div className="capability-card">
                  <h4>❓ Ask Questions About Our Community</h4>
                  <p className="capability-description">
                    Get answers to common questions about policies and amenities
                  </p>
                  <div className="example-box">
                    <strong>Try asking:</strong>
                    <ul>
                      <li>"What's your pet policy?"</li>
                      <li>"Is parking included in the rent?"</li>
                      <li>"What amenities do you offer?"</li>
                      <li>"What lease terms are available?"</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="info-box highlight">
                <strong>💡 Tip:</strong> The agent will collect your contact information when you book a tour so our leasing team can confirm the appointment with you.
              </div>
            </div>
          )}

          {selectedTab === 'residents' && (
            <div className="tab-content">
              <h3>What You Can Do As A Resident</h3>
              <p className="description">
                Get answers to your questions and easily file maintenance requests or complaints.
              </p>

              <div className="capability-section">
                <div className="capability-card">
                  <h4>❓ Ask Community Questions</h4>
                  <p className="capability-description">
                    Get answers about policies, amenities, and lease information
                  </p>
                  <div className="example-box">
                    <strong>Try asking:</strong>
                    <ul>
                      <li>"What's your guest policy?"</li>
                      <li>"How do I pay my rent?"</li>
                      <li>"What's included in my lease?"</li>
                    </ul>
                  </div>
                </div>

                <div className="capability-card">
                  <h4>🔧 File a Maintenance Request</h4>
                  <p className="capability-description">
                    Report maintenance issues that need attention
                  </p>
                  <div className="example-box">
                    <strong>Try saying:</strong>
                    <ul>
                      <li>"My air conditioning isn't working"</li>
                      <li>"There's a leak in my kitchen sink"</li>
                      <li>"The door lock needs to be fixed"</li>
                    </ul>
                  </div>
                </div>

                <div className="capability-card">
                  <h4>📝 File a Complaint</h4>
                  <p className="capability-description">
                    Report non-maintenance issues or general concerns
                  </p>
                  <div className="example-box">
                    <strong>Try saying:</strong>
                    <ul>
                      <li>"I'm experiencing noise from my neighbors"</li>
                      <li>"The common area is not being maintained properly"</li>
                      <li>"I have a complaint about..."</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="info-box highlight">
                <strong>💡 Tip:</strong> When you call, have your unit number ready so our agent can verify your residency and process your request faster.
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <div className="phone-section">
            <p className="phone-label">Ready to Call?</p>
            <a href={`tel:${agentPhone.replace(/-/g, '')}`} className="phone-link">
              <span className="phone-icon">☎️</span>
              <span className="phone-number">{agentPhone}</span>
            </a>
            <p className="phone-info">Available 24/7 • Direct connection • No wait time</p>
          </div>
        </div>
      </div>
    </div>
  )
}
