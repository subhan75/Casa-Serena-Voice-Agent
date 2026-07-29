import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import './FAQ.css'

interface FAQItem {
  faq_id: string
  question: string
  answer: string
  audience: string
  created_at: string
}

export default function FAQ() {
  const [faqs, setFAQs] = useState<FAQItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetchFAQs()
  }, [])

  async function fetchFAQs() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('faq_id', { ascending: true })

      if (error) throw error

      setFAQs(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load FAQs')
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="faq-error">
        <p>Unable to load FAQs: {error}</p>
      </div>
    )
  }

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>
  }

  return (
    <div className="faq">
      <div className="faq-list">
        {faqs.map(faq => (
          <div key={faq.faq_id} className="faq-item">
            <button
              className="faq-question"
              onClick={() => setExpandedId(expandedId === faq.faq_id ? null : faq.faq_id)}
            >
              <span>{faq.question}</span>
              <span className={`faq-icon ${expandedId === faq.faq_id ? 'open' : ''}`}>
                ▼
              </span>
            </button>
            {expandedId === faq.faq_id && (
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="faq-cta">
        <p>
          Can't find the answer? Call our AI agent to ask anything about policies,
          amenities, lease terms, and more.
        </p>
      </div>
    </div>
  )
}
