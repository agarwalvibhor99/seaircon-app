export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Auth is handled by middleware, so we just render the children
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}
