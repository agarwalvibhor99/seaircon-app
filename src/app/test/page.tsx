'use client'

export default function TestPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>Test Page</h1>
        <p style={{ color: '#6b7280' }}>If you can see this styled page, CSS is working!</p>
        <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#dbeafe', border: '1px solid #93c5fd', borderRadius: '4px' }}>
          <p style={{ color: '#1e40af' }}>This should be blue if styling is working properly.</p>
        </div>
        <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded">
          <p className="text-red-800">This should be red if Tailwind CSS is loading properly.</p>
        </div>
      </div>
    </div>
  )
}
