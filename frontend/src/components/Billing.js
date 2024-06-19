import React, { useState } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert } from 'react-bootstrap';

const Billing = () => {
  const [billingFormData, setBillingFormData] = useState({
    patient_id: '',
    medicine_name: '',
    qty_sold: 1
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);


  const handleBillingFormChange = (e) => {
    setBillingFormData({ ...billingFormData, medicine_name: e.target.value });
  };

  const handleBillingFormSubmit = async (e) => {
    e.preventDefault();

    // Validate form data (consider using a library like Yup for more complex validation)
    if (!billingFormData.patient_id || !billingFormData.medicine_name) {
      setError('Please fill in all required fields (Patient ID and Medicine Name)');
      return;
    }

    const payload = { ...billingFormData }; // Destructure to avoid potential mutation issues

    try {
      const response = await axios.post('http://localhost:5000/billing', payload);
      console.log(response.data);
      setSuccess('Bill generated successfully!');
      setError(null);
    } catch (error) {
      setError('Error generating bill: ' + error.message);
      setSuccess(null);
    }
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
            onChange={(e) => setBillingFormData({ ...billingFormData, patient_id: e.target.value })}
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
            onChange={(e) => setBillingFormData({ ...billingFormData, qty_sold: parseInt(e.target.value) })}
            required
            min={1} // Set minimum quantity to 1 (optional)
          />
        </Form.Group>
        <Button type="submit" disabled={false} >
          Generate Bill
        </Button>
      </Form>
    </Container>
  );
};

export default Billing;
