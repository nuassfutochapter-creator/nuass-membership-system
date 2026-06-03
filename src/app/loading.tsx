export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div
          className="w-10 h-10 border-4 rounded-full animate-spin mx-auto mb-4"
          style={{ borderColor: 'rgba(13,92,46,0.2)', borderTopColor: '#0d5c2e' }}
        />
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    </div>
  )
}
