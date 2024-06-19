import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Table, Modal, Button, Form, Alert } from 'react-bootstrap';

const Dashboard = () => {
  const [sales, setSales] = useState([]);
  const [stock, setStock] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    product_name: '',
    mfg_by: '',
    pack: '',
    batch: '',
    exp: '',
    qty: '',
    mrp: ''
  });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchSales();
    fetchStock();
  }, []);

  const fetchSales = async () => {
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];

    try {
      const response = await axios.get(`http://localhost:5000/sales?start_date=${formattedStartDate}&end_date=${formattedEndDate}`);
      setSales(response.data.sales);
      setTotalEarnings(response.data.total_earnings);
      setError(null);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      setError('Error fetching sales data: ' + (error.response?.data?.message || error.message));
    }
  };

  const fetchStock = async () => {
    try {
      const response = await axios.get('http://localhost:5000/stock');
      setStock(response.data);
    } catch (error) {
      console.error('Error fetching stock data:', error);
      setError('Error fetching stock data. Please try again later.');
    }
  };

  const handleShow = () => setShowModal(true);

  const handleClose = () => {
    setShowModal(false);
    resetFormData();
    setMessage(null);
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/stock', formData);
      setMessage(response.data.message);
      fetchStock(); // Refresh stock data after successful submission
    } catch (error) {
      const errorMessage = error.response ? error.response.data.message : 'Error adding stock item';
      setError(errorMessage);
    } finally {
      handleClose();
    }
  };

  const resetFormData = () => {
    setFormData({
      product_name: '',
      mfg_by: '',
      pack: '',
      batch: '',
      exp: '',
      qty: '',
      mrp: ''
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
      <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '20px' }}>
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
            {sales.map((sale, saleIndex) => (
              sale.medicines.map((medicine, medIndex) => (
                <tr key={`${saleIndex}-${medIndex}`}>
                  <td>{sale.patient_id}</td>
                  <td>{medicine.medicine_name}</td>
                  <td>{medicine.qty_sold}</td>
                  <td>{medicine.qty_remaining}</td>
                  <td>{medicine.mrp}</td>
                  <td>{medicine.bill_amount}</td>
                  <td>{new Date(sale.transaction_time).toLocaleString()}</td>
                </tr>
              ))
            ))}
          </tbody>
        </Table>
      </div>

      <h1>Stock Information</h1>
      <Button variant="primary" onClick={handleShow}>
        Add/Edit Stock
      </Button>
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add/Edit Stock</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="productName">
              <Form.Label>Product Name</Form.Label>
              <Form.Control type="text" name="product_name" value={formData.product_name} onChange={handleChange} required />
            </Form.Group>
            <Form.Group controlId="mfgBy">
              <Form.Label>Manufacturer</Form.Label>
              <Form.Control type="text" name="mfg_by" value={formData.mfg_by} onChange={handleChange} required />
            </Form.Group>
            <Form.Group controlId="pack">
              <Form.Label>Pack</Form.Label>
              <Form.Control type="text" name="pack" value={formData.pack} onChange={handleChange} required />
            </Form.Group>
            <Form.Group controlId="batch">
              <Form.Label>Batch</Form.Label>
              <Form.Control type="text" name="batch" value={formData.batch} onChange={handleChange} required />
            </Form.Group>
            <Form.Group controlId="expiryDate">
              <Form.Label>Expiry Date</Form.Label>
              <Form.Control type="text" name="exp" value={formData.exp} onChange={handleChange} required />
            </Form.Group>
            <Form.Group controlId="quantity">
              <Form.Label>Quantity</Form.Label>
              <Form.Control type="number" name="qty" value={formData.qty} onChange={handleChange} required />
            </Form.Group>
            <Form.Group controlId="mrp">
              <Form.Label>MRP</Form.Label>
              <Form.Control type="number" name="mrp" value={formData.mrp} onChange={handleChange} required />
            </Form.Group>
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Manufacturer</th>
              <th>Pack</th>
              <th>Batch</th>
              <th>Expiry Date</th>
              <th>Quantity</th>
              <th>MRP</th>
            </tr>
          </thead>
          <tbody>
            {stock.map((item, index) => (
              <tr key={index}>
                <td>{item.product_name}</td>
                <td>{item.mfg_by}</td>
                <td>{item.pack}</td>
                <td>{item.batch}</td>
                <td>{item.exp}</td>
                <td>{item.qty}</td>
                <td>{item.mrp}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </Container>
  );
};

export default Dashboard;
