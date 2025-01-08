'use client';

export default function ZKPage() {

  const fetchReserves = async () => {
      alert("hi")
  };


  return (
    <div className="min-h-screen flex items-center justify-center">
      <button 
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        onClick={fetchReserves}
      >
        클릭하세요
      </button>
    </div>
  )
}