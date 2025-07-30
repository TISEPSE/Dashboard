"use client"

export default function MessagePage() {
  return (
    <div className="min-h-screen bg-[#212332] text-white px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-4">Messages</h1>
          <p className="text-gray-400 text-lg">
            Cette section est en cours de développement.
          </p>
        </div>
      </div>
    </div>
  )
}