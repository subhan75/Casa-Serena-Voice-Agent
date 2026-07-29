import { useState, useEffect } from 'react'
import Hero from './components/Hero'
import Listings from './components/Listings'
import FAQ from './components/FAQ'
import CallWidget from './components/CallWidget'
import Dashboard from './components/Dashboard'
import './App.css'

function App() {
  const [activeSection, setActiveSection] = useState<'home' | 'dashboard'>('home')

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[data-section]')
      sections.forEach(section => {
        const rect = section.getBoundingClientRect()
        if (rect.top < window.innerHeight / 2) {
          const sectionName = section.getAttribute('data-section')
          if (sectionName && sectionName !== 'dashboard') {
            setActiveSection('home')
          }
        }
      })
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="app">
      <nav className="nav">
        <div className="nav-container container">
          <div className="nav-brand">
            <h2>Casa Serena</h2>
          </div>
          <div className="nav-links">
            <button
              className={`nav-link ${activeSection === 'home' ? 'active' : ''}`}
              onClick={() => {
                setActiveSection('home')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            >
              Home
            </button>
            <button
              className={`nav-link ${activeSection === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveSection('dashboard')}
            >
              Dashboard
            </button>
          </div>
        </div>
      </nav>

      {activeSection === 'home' ? (
        <main>
          <Hero />

          <section data-section="listings" className="section">
            <div className="container">
              <h2 className="section-title">Available Units</h2>
              <p className="section-subtitle">
                Explore our apartments or call our AI agent to learn more
              </p>
              <Listings />
            </div>
          </section>

          <section data-section="call-widget" className="call-widget-section">
            <div className="container">
              <div className="call-widget-wrapper">
                <div className="call-widget-content">
                  <h2>Speak with Our AI Agent</h2>
                  <p>
                    Curious about availability, pricing, or policies? Our voice AI agent is ready to help.
                    Ask about units, book a tour, or file a maintenance request if you're a resident.
                  </p>
                  <CallWidget />
                </div>
              </div>
            </div>
          </section>

          <section data-section="faq" className="section section-light">
            <div className="container">
              <h2 className="section-title">Frequently Asked Questions</h2>
              <p className="section-subtitle">
                Find answers to common questions about our community
              </p>
              <FAQ />
            </div>
          </section>
        </main>
      ) : (
        <main>
          <Dashboard />
        </main>
      )}

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Casa Serena Apartments</h4>
              <p>A demo/portfolio project showcasing voice AI for apartment communities.</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#listings">Listings</a></li>
                <li><a href="#faq">FAQ</a></li>
                <li><a href="https://github.com">GitHub</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Contact</h4>
              <p>Built with Supabase, Vapi, and React</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 Casa Serena Apartments. Demo project.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
