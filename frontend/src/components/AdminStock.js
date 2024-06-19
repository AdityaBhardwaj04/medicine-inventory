import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Table, Modal, Button, Form, Alert } from 'react-bootstrap';

const AdminStock = () => {
  const [showModal, setShowModal] = useState(false);
  const [stock, setStock] = useState([]);
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
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      const response = await axios.get('http://localhost:5000/stock');
      setStock(response.data);
    } catch (error) {
      console.error('Error fetching stock data:', error);
      setError('Error fetching stock data. Please try again later.');
    }
  };

  const handleClose = () => {
    setShowModal(false);
    resetFormData();
    setMessage(null);
    setError(null);
  };

  const handleShow = () => setShowModal(true);

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

    </Container>
  );
};

export default AdminStock;
