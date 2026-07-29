import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import './Listings.css'

interface Unit {
  unit_number: string
  bedrooms: number
  price: number
  is_available: boolean
  available_date: string
  created_at: string
}

export default function Listings() {
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filteredUnits, setFilteredUnits] = useState<Unit[]>([])
  const [bedroomFilter, setBedroomFilter] = useState<number | null>(null)

  useEffect(() => {
    fetchUnits()
  }, [])

  useEffect(() => {
    if (bedroomFilter === null) {
      setFilteredUnits(units)
    } else {
      setFilteredUnits(units.filter(u => u.bedrooms === bedroomFilter))
    }
  }, [bedroomFilter, units])

  async function fetchUnits() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .eq('is_available', true)
        .order('price', { ascending: true })

      if (error) throw error

      setUnits(data || [])
      setFilteredUnits(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load units')
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="listings-error">
        <p>Unable to load listings: {error}</p>
        <button onClick={fetchUnits}>Try Again</button>
      </div>
    )
  }

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>
  }

  const uniqueBedrooms = [...new Set(units.map(u => u.bedrooms))].sort()

  return (
    <div className="listings">
      <div className="listings-filters">
        <button
          className={`filter-btn ${bedroomFilter === null ? 'active' : ''}`}
          onClick={() => setBedroomFilter(null)}
        >
          All Units ({units.length})
        </button>
        {uniqueBedrooms.map(br => (
          <button
            key={br}
            className={`filter-btn ${bedroomFilter === br ? 'active' : ''}`}
            onClick={() => setBedroomFilter(br)}
          >
            {br} Bed ({units.filter(u => u.bedrooms === br).length})
          </button>
        ))}
      </div>

      {filteredUnits.length === 0 ? (
        <p className="listings-empty">No units match your criteria</p>
      ) : (
        <div className="listings-grid">
          {filteredUnits.map(unit => {
            const bedroomImages: Record<number, string> = {
              1: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop',
              2: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop',
              3: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop'
            }
            const imageUrl = bedroomImages[unit.bedrooms] || 'https://images.unsplash.com/photo-1484480974769-47a86da4e290?w=400&h=300&fit=crop'

            return (
              <div key={unit.unit_number} className="unit-card card">
                <div className="unit-image">
                  <img
                    src={imageUrl}
                    alt={`Unit ${unit.unit_number} - ${unit.bedrooms} bedroom`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%234A5568' width='400' height='300'/%3E%3Ctext x='50%25' y='40%25' text-anchor='middle' fill='white' font-size='28' font-weight='bold'%3EUnit ${unit.unit_number}%3C/text%3E%3Ctext x='50%25' y='60%25' text-anchor='middle' fill='white' font-size='20'%3E${unit.bedrooms} Bedroom%3C/text%3E%3C/svg%3E`
                    }}
                  />
                </div>

                <div className="unit-header">
                  <h3>Unit {unit.unit_number}</h3>
                  <span className={`unit-status ${unit.is_available ? 'available' : 'unavailable'}`}>
                    {unit.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                <div className="unit-specs">
                  <div className="spec">
                    <span className="spec-label">Bedrooms</span>
                    <span className="spec-value">{unit.bedrooms}</span>
                  </div>
                </div>

                <div className="unit-footer">
                  <div className="unit-price">
                    <p className="price-label">Monthly Rent</p>
                    <p className="price-value">${unit.price.toLocaleString()}</p>
                  </div>
                  <div className="unit-date">
                    <p className="date-label">Available</p>
                    <p className="date-value">
                      {new Date(unit.available_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <p className="unit-cta">
                  Call our AI agent to schedule a tour or get more details
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
