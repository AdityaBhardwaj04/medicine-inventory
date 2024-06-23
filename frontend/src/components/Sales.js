import React, { useState, useEffect } from 'react';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const response = await fetch('/api/sales');

      // Check if the response is not successful
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Error ${response.status}: ${errorMessage}`);
      }

      const data = await response.json();
      setSales(data.sales);  // Assuming the response has a 'sales' key
    } catch (error) {
      console.error('Error fetching sales data:', error);
      setError(error.message);  // Store the error message in state
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Sales Dashboard</h1>
      {error && <div className="alert alert-danger">Error: {error}</div>}
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id}>
                <td>{sale.id}</td>
                <td>{new Date(sale.date).toLocaleDateString()}</td>
                <td>{sale.customer}</td>
                <td>${sale.amount.toFixed(2)}</td>
                <td>
                  <span className={`badge bg-${sale.status === 'Completed' ? 'success' : 'warning'}`}>
                    {sale.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Sales;
