import React, { useState } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert } from 'react-bootstrap';

const Billing = () => {
  const [billingFormData, setBillingFormData] = useState({
    patient_id: '',
    medicine_name: '',
    qty_sold: 0
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleBillingFormChange = (e) => {
    const { name, value } = e.target;
    setBillingFormData({
      ...billingFormData,
      [name]: name === 'qty_sold' ? parseInt(value) : value
    });
  };

  const handleBillingFormSubmit = (e) => {
    e.preventDefault();
    // Create the payload as the backend expects
    const payload = {
      patient_id: billingFormData.patient_id,
      cart: [{
        medicine_name: billingFormData.medicine_name,
        qty_sold: billingFormData.qty_sold
      }]
    };
    axios.post('http://localhost:5000/billing', payload)
      .then(response => {
        console.log(response.data);
        setSuccess('Bill generated successfully!');
        setError(null);
      })
      .catch(error => {
        setError('Error generating bill: ' + error.message);
        setSuccess(null);
      });
  };

  return (
    <Container>
      <h1>Generate Bill</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handleBillingFormSubmit}>
        <Form.Group>
          <Form.Label>Patient ID</Form.Label>
          <Form.Control
            type="text"
            name="patient_id"
            value={billingFormData.patient_id}
            onChange={handleBillingFormChange}
            required
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Medicine Name</Form.Label>
          <Form.Control
            type="text"
            name="medicine_name"
            value={billingFormData.medicine_name}
            onChange={handleBillingFormChange}
            required
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Quantity Sold</Form.Label>
          <Form.Control
            type="number"
            name="qty_sold"
            value={billingFormData.qty_sold}
            onChange={handleBillingFormChange}
            required
          />
        </Form.Group>
        <Button type="submit">Generate Bill</Button>
      </Form>
    </Container>
  );
};

export default Billing;
