const TablePreview = ({ title, data, columns, emptyMessage = 'No data available', maxRows = 5 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="card animate-fade-in">
        <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-500 text-center py-8">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="card animate-fade-in">
      <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              {columns.map((col, idx) => (
                <th key={idx} className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, maxRows).map((row, rowIdx) => (
              <tr key={rowIdx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="py-3 px-4 text-sm text-gray-700">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length > maxRows && (
        <p className="text-xs text-gray-500 mt-3 text-center">
          Showing {maxRows} of {data.length} entries
        </p>
      )}
    </div>
  );
};

export default TablePreview;

