import React, { useState } from 'react';

const TransfusionHistory = ({ history, onAdd, loading }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newTransfusion, setNewTransfusion] = useState({
    date: new Date().toISOString().split('T')[0],
    units: 1,
    hb_value: '',
    doctor: '',
    hospital: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTransfusion(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newTransfusion.hb_value) {
      alert('Hemoglobin value is required');
      return;
    }
    onAdd({
      ...newTransfusion,
      date: new Date(newTransfusion.date),
      units: parseFloat(newTransfusion.units),
      hb_value: parseFloat(newTransfusion.hb_value)
    });
    setShowAdd(false);
    setNewTransfusion({
      date: new Date().toISOString().split('T')[0],
      units: 1,
      hb_value: '',
      doctor: '',
      hospital: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Transfusion History</h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showAdd ? 'bg-gray-200 text-gray-700' : 'bg-health-blue text-white'
          }`}
        >
          {showAdd ? 'Cancel' : '+ Add Record'}
        </button>
      </div>

      {showAdd && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 shadow-sm animate-fade-in">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Add Transfusion Record</h3>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={newTransfusion.date}
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-1">Units (Blood)</label>
              <input
                type="number"
                name="units"
                min="0.5"
                max="6"
                step="0.5"
                value={newTransfusion.units}
                onChange={handleChange}
                className={`w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm ${newTransfusion.units > 3 ? 'border-amber-400 bg-amber-50' : ''}`}
                required
                placeholder="e.g. 1"
              />
              <p className="text-[10px] text-blue-500 mt-1 font-bold">Hard: 0.5-6 | Alert: &gt;3 units</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-1">Hb Level (g/dL)</label>
              <input
                type="number"
                name="hb_value"
                step="0.1"
                min="2"
                max="20"
                placeholder="e.g. 9.5"
                value={newTransfusion.hb_value}
                onChange={handleChange}
                className={`w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm ${newTransfusion.hb_value && (newTransfusion.hb_value < 5 || newTransfusion.hb_value > 18) ? 'border-amber-400 bg-amber-50' : ''}`}
                required
              />
              <p className="text-[10px] text-blue-500 mt-1 font-bold">Hard: 2-20 | Alert: &lt;5 or &gt;18 g/dL</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-1">Doctor/Clinic</label>
              <input
                type="text"
                name="doctor"
                placeholder="Optional"
                value={newTransfusion.doctor}
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <div className="md:col-span-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Record'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Units</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Hb Level</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Doctor</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {history && history.length > 0 ? (
              [...history].reverse().map((record, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold">
                      {record.units} {record.units === 1 ? 'Unit' : 'Units'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <span className={`font-semibold ${record.hb_value < 9 ? 'text-red-600' : 'text-green-600'}`}>
                      {record.hb_value} g/dL
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {record.doctor || 'N/A'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-10 text-center text-gray-400 italic">
                  No transfusion records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransfusionHistory;
