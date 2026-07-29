interface HeroProps {
  onOpenModal: () => void
}

export default function Hero({ onOpenModal }: HeroProps) {
  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-content">
          <h1>Find Your Home at Casa Serena</h1>
          <p>
            A modern apartment community where voice AI helps you explore units,
            book tours, and get answers instantly.
          </p>
          <button className="hero-cta" onClick={onOpenModal}>
            Call Our AI Agent
          </button>
        </div>
      </div>
    </section>
  )
}
