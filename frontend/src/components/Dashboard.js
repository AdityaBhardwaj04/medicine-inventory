import React, { useState } from 'react';
import axios from 'axios';
import { Container, Table, Form, Button, Alert } from 'react-bootstrap';

const Dashboard = () => {
  const [sales, setSales] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [error, setError] = useState(null);

  const fetchSales = () => {
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];

    axios.get(`http://localhost:5000/sales?start_date=${formattedStartDate}&end_date=${formattedEndDate}`)
      .then(response => {
        setSales(response.data.sales);
        setTotalEarnings(response.data.total_earnings);
        setError(null);
      })
      .catch(error => {
        console.error('Error fetching sales data:', error);
        setError('Error fetching sales data: ' + (error.response?.data?.message || error.message));
      });
  };

  return (
    <Container>
      <h1>Sales Dashboard</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form inline>
        <Form.Group>
          <Form.Label>Start Date</Form.Label>
          <Form.Control type="date" value={startDate.toISOString().split('T')[0]} onChange={e => setStartDate(new Date(e.target.value))} />
        </Form.Group>
        <Form.Group>
          <Form.Label>End Date</Form.Label>
          <Form.Control type="date" value={endDate.toISOString().split('T')[0]} onChange={e => setEndDate(new Date(e.target.value))} />
        </Form.Group>
        <Button onClick={fetchSales}>Fetch Sales Data</Button>
      </Form>
      <h2>Total Earnings: ₹{totalEarnings}</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Patient ID</th>
            <th>Medicine Name</th>
            <th>Quantity Sold</th>
            <th>Quantity Remaining</th>
            <th>MRP</th>
            <th>Bill Amount</th>
            <th>Transaction Time</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale, index) => (
            <tr key={index}>
              <td>{sale.patient_id}</td>
              <td>{sale.medicine_name}</td>
              <td>{sale.qty_sold}</td>
              <td>{sale.qty_remaining}</td>
              <td>{sale.mrp}</td>
              <td>{sale.bill_amount}</td>
              <td>{new Date(sale.transaction_time).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Dashboard;
