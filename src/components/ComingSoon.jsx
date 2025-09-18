import { Clock } from "lucide-react";

export default function ComingSoon() {
  return (
    <div className="flex items-center justify-center h-[80vh] bg-gray-50">
      <div className="bg-white shadow-md rounded-xl p-8 max-w-md text-center">
        <div className="flex justify-center mb-4">
          <Clock className="w-12 h-12 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Coming Soon</h1> 
        <p className="text-gray-600 mt-2">
          This feature is under development and will be available shortly.  
          Stay tuned for updates.
        </p>
        <div className="mt-6">
          <button className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition" onClick={() => window.history.back()}> 
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
