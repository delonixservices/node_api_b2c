import { FiDownload } from "react-icons/fi";

export default function FlightTransactionTab() {
  return (
    <aside className="w-full p-5 bg-gray-50 rounded shadow-md">
      <div className="mb-5 border-b border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-semibold text-gray-800 leading-8">
            Flight Details
            <br />
            <p className="text-xs font-medium text-gray-600 flex items-center gap-2">
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md shadow">
                Completed
              </span>
              <span>Delhi to Mumbai</span>
              <span>Booked on: 22nd March, 2025</span>
            </p>
          </h3>
          <div className="text-right">
            <button className="px-3 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
              View Ticket
            </button>
            <p className="text-sm text-gray-600 mt-2">
              PNR: <span className="font-medium">ABC123456</span>
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-10">
        <div>
          <p className="text-sm text-stone-600">Departure</p>
          <p className="font-medium text-stone-900">Jan 15, 2023 • 10:30 AM</p>
        </div>
        <div>
          <p className="text-sm text-stone-600">Arrival</p>
          <p className="font-medium text-stone-900">Jan 15, 2023 • 12:45 PM</p>
        </div>
        <div>
          <p className="text-sm text-stone-600">Airline</p>
          <p className="font-medium text-stone-900">IndiGo</p>
        </div>
        <div>
          <p className="text-sm text-stone-600">Passengers</p>
          <p className="font-medium text-stone-900">2 Adults</p>
        </div>
        <button className="mt-3 flex items-center gap-2 text-blue-600 ml-auto">
          <FiDownload />
          Download E-Ticket
        </button>
      </div>
    </aside>
  );
}
