import AgentModal from './AgentModal'
import './CallWidget.css'

interface CallWidgetProps {
  onOpenModal: () => void
}

export default function CallWidget({ onOpenModal }: CallWidgetProps) {
  const agentPhone = '636-481-9140'

  return (
    <>
      <div className="call-widget">
        <div className="call-widget-content">
          <div className="phone-icon">☎️</div>
          <h3>Speak with Our Agent</h3>
          <p className="description">
            Call our apartment specialist to ask about availability, pricing, tours, or any questions you have.
          </p>

          <div className="phone-display">
            <p className="phone-label">Call Now</p>
            <a href={`tel:${agentPhone.replace(/-/g, '')}`} className="phone-number">
              {agentPhone}
            </a>
          </div>

          <button className="learn-more-btn" onClick={onOpenModal}>
            Learn More About Our AI Agent
          </button>

          <p className="info-text">
            Available 24/7 • Direct connection • No wait time
          </p>
        </div>
      </div>
    </>
  )
}
