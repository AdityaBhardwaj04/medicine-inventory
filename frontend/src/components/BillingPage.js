import React, { useState } from 'react';
import { Modal, Button, Form, Container, Alert } from 'react-bootstrap';

const BillingPage = () => {
  const [cart, setCart] = useState([]);
  const [patientId, setPatientId] = useState('');
  const [medicineName, setMedicineName] = useState('');
  const [qtyBought, setQtyBought] = useState('');
  const [billDetails, setBillDetails] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const addToCart = () => {
    if (!patientId || !medicineName || !qtyBought) {
      setErrorMessage("All fields are required.");
      return;
    }

    setCart([...cart, {
      medicine_name: medicineName,
      qty_sold: parseInt(qtyBought)
    }]);

    setMedicineName('');
    setQtyBought('');
    setErrorMessage('');
  };

  const generateBill = () => {
    if (cart.length === 0) {
      setErrorMessage("Cart is empty. Add items to the cart before generating a bill.");
      return;
    }

    fetch('http://localhost:5000/billing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ patient_id: patientId, medicines: cart })
    })
      .then(response => response.json())
      .then(data => {
        if (data.message) {
          setBillDetails(data);
          setShowModal(true);
          setCart([]);
        } else {
          setErrorMessage("An error occurred: " + data.error);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setErrorMessage("An error occurred while generating the bill.");
      });
  };

  const handleClose = () => setShowModal(false);

  return (
    <Container>
      <h1>Billing Page</h1>
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
      <Form>
        <Form.Group controlId="formPatientId">
          <Form.Label>Patient ID</Form.Label>
          <Form.Control
            type="text"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="formMedicineName">
          <Form.Label>Medicine Name</Form.Label>
          <Form.Control
            type="text"
            value={medicineName}
            onChange={(e) => setMedicineName(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="formQtyBought">
          <Form.Label>Quantity Bought</Form.Label>
          <Form.Control
            type="number"
            value={qtyBought}
            onChange={(e) => setQtyBought(e.target.value)}
            required
          />
        </Form.Group>
        <Button variant="primary" onClick={addToCart}>
          Add to Cart
        </Button>
      </Form>
      <Button variant="success" onClick={generateBill} className="mt-3">
        Generate Bill
      </Button>

      <h3 className="mt-4">Cart</h3>
      <ul>
        {cart.map((item, index) => (
          <li key={index}>{item.medicine_name} - Quantity: {item.qty_sold}</li>
        ))}
      </ul>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Bill Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {billDetails && billDetails.bill_items ? (
            <div>
              <p>Patient ID: {patientId}</p>
              <ul>
                {billDetails.bill_items.map((item, index) => (
                  <li key={index}>{item.medicine_name} - Quantity: {item.qty_sold} - Amount: ₹{item.bill_amount}</li>
                ))}
              </ul>
              <p>Total Bill Amount: ₹{billDetails.total_amount}</p>
            </div>
          ) : (
            <Alert variant="warning">No bill details available</Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default BillingPage;
