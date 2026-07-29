import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import './Dashboard.css'

interface Tour {
  confirmation_id: string
  name: string
  phone: string
  unit_number: string
  tour_time: string
  created_at: string
}

interface Ticket {
  ticket_id: string
  resident_id: string
  category: string
  issue_description: string
  urgency: string
  created_at: string
}

interface CallLog {
  log_id: string
  caller_type: string
  outcome: string
  summary: string
  created_at: string
}

interface Stats {
  total_tours: number
  total_tickets: number
  total_calls: number
  tickets_by_urgency: Record<string, number>
}

export default function Dashboard() {
  const [tours, setTours] = useState<Tour[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [callLogs, setCallLogs] = useState<CallLog[]>([])
  const [stats, setStats] = useState<Stats>({
    total_tours: 0,
    total_tickets: 0,
    total_calls: 0,
    tickets_by_urgency: {}
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'tours' | 'tickets' | 'calls'>('overview')

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 5000)
    return () => clearInterval(interval)
  }, [])

  async function fetchDashboardData() {
    try {
      setLoading(true)

      const [toursRes, ticketsRes, callsRes] = await Promise.all([
        supabase.from('tours').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('maintenance_tickets').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('call_logs').select('*').order('created_at', { ascending: false }).limit(50),
      ])

      if (toursRes.error) throw toursRes.error
      if (ticketsRes.error) throw ticketsRes.error
      if (callsRes.error) throw callsRes.error

      const toursData = toursRes.data || []
      const ticketsData = ticketsRes.data || []
      const callsData = callsRes.data || []

      setTours(toursData as Tour[])
      setTickets(ticketsData as Ticket[])
      setCallLogs(callsData as CallLog[])

      const urgencyCounts = ticketsData.reduce((acc: Record<string, number>, t: any) => {
        acc[t.urgency] = (acc[t.urgency] || 0) + 1
        return acc
      }, {})

      setStats({
        total_tours: toursData.length,
        total_tickets: ticketsData.length,
        total_calls: callsData.length,
        tickets_by_urgency: urgencyCounts
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <p>Unable to load dashboard: {error}</p>
        <button onClick={fetchDashboardData}>Retry</button>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Live Dashboard</h1>
        <p>Real-time view of tours, tickets, and call activity</p>
        <button className="refresh-btn" onClick={fetchDashboardData} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh Now'}
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.total_calls}</div>
            <div className="stat-label">Total Calls</div>
            <p className="stat-description">Inbound voice calls handled</p>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.total_tours}</div>
            <div className="stat-label">Tours Booked</div>
            <p className="stat-description">Apartment viewings scheduled</p>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.total_tickets}</div>
            <div className="stat-label">Support Tickets</div>
            <p className="stat-description">Maintenance & complaints filed</p>
          </div>
          <div className="stat-card">
            <div className="stat-urgency">
              <div className="urgency-item high">
                <span className="urgency-label">High</span>
                <span className="urgency-count">{stats.tickets_by_urgency['HIGH'] || 0}</span>
              </div>
              <div className="urgency-item medium">
                <span className="urgency-label">Medium</span>
                <span className="urgency-count">{stats.tickets_by_urgency['MEDIUM'] || 0}</span>
              </div>
              <div className="urgency-item low">
                <span className="urgency-label">Low</span>
                <span className="urgency-count">{stats.tickets_by_urgency['LOW'] || 0}</span>
              </div>
            </div>
            <div className="stat-label">Tickets by Urgency</div>
          </div>
        </div>
      )}

      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'tours' ? 'active' : ''}`}
          onClick={() => setActiveTab('tours')}
        >
          Tours ({tours.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'tickets' ? 'active' : ''}`}
          onClick={() => setActiveTab('tickets')}
        >
          Tickets ({tickets.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'calls' ? 'active' : ''}`}
          onClick={() => setActiveTab('calls')}
        >
          Calls ({callLogs.length})
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'tours' && (
          <div className="table-container">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Confirmation ID</th>
                  <th>Caller Name</th>
                  <th>Unit</th>
                  <th>Tour Time</th>
                  <th>Phone</th>
                  <th>Booked</th>
                </tr>
              </thead>
              <tbody>
                {tours.length === 0 ? (
                  <tr><td colSpan={6} className="empty-cell">No tours booked yet</td></tr>
                ) : (
                  tours.map(tour => (
                    <tr key={tour.confirmation_id}>
                      <td><code>{tour.confirmation_id}</code></td>
                      <td>{tour.name}</td>
                      <td>{tour.unit_number}</td>
                      <td>{new Date(tour.tour_time).toLocaleString()}</td>
                      <td>{tour.phone}</td>
                      <td className="date-cell">
                        {new Date(tour.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'tickets' && (
          <div className="table-container">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Category</th>
                  <th>Issue</th>
                  <th>Urgency</th>
                  <th>Filed</th>
                </tr>
              </thead>
              <tbody>
                {tickets.length === 0 ? (
                  <tr><td colSpan={6} className="empty-cell">No tickets filed yet</td></tr>
                ) : (
                  tickets.map(ticket => (
                    <tr key={ticket.ticket_id}>
                      <td><code>{ticket.ticket_id}</code></td>
                      <td className="capitalize">{ticket.category}</td>
                      <td className="truncate" title={ticket.issue_description}>
                        {ticket.issue_description.substring(0, 40)}...
                      </td>
                      <td>
                        <span className={`urgency-badge ${ticket.urgency.toLowerCase()}`}>
                          {ticket.urgency}
                        </span>
                      </td>
                      <td className="date-cell">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'calls' && (
          <div className="table-container">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Log ID</th>
                  <th>Caller Type</th>
                  <th>Outcome</th>
                  <th>Summary</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {callLogs.length === 0 ? (
                  <tr><td colSpan={5} className="empty-cell">No calls logged yet</td></tr>
                ) : (
                  callLogs.map(log => (
                    <tr key={log.log_id}>
                      <td><code>{log.log_id}</code></td>
                      <td>
                        <span className={`badge ${log.caller_type.toLowerCase()}`}>
                          {log.caller_type}
                        </span>
                      </td>
                      <td className="capitalize">{log.outcome}</td>
                      <td className="truncate" title={log.summary}>
                        {log.summary.substring(0, 50)}...
                      </td>
                      <td className="date-cell">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
