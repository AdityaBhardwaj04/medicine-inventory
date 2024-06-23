import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Table, Alert, Row, Col } from 'react-bootstrap';
import Autocomplete from 'react-autocomplete';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const BillingPage = () => {
  const [cart, setCart] = useState([]);
  const [patientId, setPatientId] = useState('');
  const [medicineName, setMedicineName] = useState('');
  const [qtyBought, setQtyBought] = useState('');
  const [mrp, setMrp] = useState('');
  const [discount, setDiscount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [medicineOptions, setMedicineOptions] = useState([]);

  useEffect(() => {
    fetchMedicineList();
  }, []);

  const fetchMedicineList = async () => {
    try {
      const response = await fetch('http://localhost:5000/medicines');
      const data = await response.json();
      if (data.medicines) {
        setMedicineOptions(data.medicines);
      } else {
        setErrorMessage('Failed to fetch medicine list');
      }
    } catch (error) {
      console.error('Error fetching medicine list:', error);
      setErrorMessage('Failed to fetch medicine list');
    }
  };

  const fetchMrp = async (medicineName) => {
    try {
      const response = await fetch(`http://localhost:5000/medicine_mrp?name=${medicineName}`);
      const data = await response.json();
      if (data.mrp) {
        setMrp(data.mrp);
      } else {
        setErrorMessage('Failed to fetch MRP');
      }
    } catch (error) {
      console.error('Error fetching MRP:', error);
      setErrorMessage('Failed to fetch MRP');
    }
  };

  const addToCart = () => {
    if (!patientId || !medicineName || !qtyBought || !mrp) {
      setErrorMessage('All fields are required.');
      return;
    }

    const itemTotal = qtyBought * mrp;
    const itemDiscount = (discount / 100) * itemTotal;
    const itemAmount = itemTotal - itemDiscount;

    const newItem = {
      medicine_name: medicineName,
      qty_sold: parseInt(qtyBought),
      mrp: parseFloat(mrp),
      discount: parseFloat(itemDiscount.toFixed(2)),
      amount: parseFloat(itemAmount.toFixed(2)),
    };

    setCart([...cart, newItem]);
    setTotalAmount(totalAmount + itemAmount);

    // Clear input fields
    setMedicineName('');
    setQtyBought('');
    setMrp('');
    setErrorMessage('');
  };

  const handleMedicineSelect = (medicineName) => {
    setMedicineName(medicineName);
    fetchMrp(medicineName);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    let yPosition = 20;

    // Title
    doc.setFontSize(18);
    doc.text('Medicine Invoice', 105, yPosition, null, null, 'center');
    yPosition += 10;
    doc.setFontSize(16);
    doc.text('Om Opticals', 105, yPosition, null, null, 'center');
    yPosition += 20;

    // Patient ID and Date
    doc.setFontSize(12);
    doc.text(`Patient ID: ${patientId}`, 20, yPosition);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, yPosition);
    yPosition += 20;

    // Table headers
    const headers = [['S. No.', 'Particulars', 'Qty', 'Discount', 'Amount']];

    // Table rows
    const rows = cart.map((item, index) => [
        index + 1,
        item.medicine_name,
        item.qty_sold,
        item.discount.toFixed(2),
        item.amount.toFixed(2)
    ]);

    // Auto-table for items
    doc.autoTable({
        startY: yPosition,
        head: headers,
        body: rows,
        theme: 'grid',
        headStyles: { fillColor: [0, 0, 0] },
        styles: { fontSize: 10 },
        tableLineColor: [0, 0, 0],
        tableLineWidth: 0.1,
    });

    // Total Amount
    yPosition = doc.autoTable.previous.finalY + 10;
    doc.setFontSize(12);
    doc.text(`Total Amount: ₹${totalAmount.toFixed(2)}`, 20, yPosition);

    // Save PDF
    doc.save('bill_receipt.pdf');
  };

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
        <Row>
          <Col>
            <Form.Group controlId="formMedicineName">
              <Form.Label>Medicine Name</Form.Label>
              <Autocomplete
                getItemValue={(item) => item}
                items={medicineOptions}
                renderItem={(item, isHighlighted) => (
                  <div key={item} style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
                    {item}
                  </div>
                )}
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
                onSelect={handleMedicineSelect}
                inputProps={{
                  className: 'form-control'
                }}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="formQtyBought">
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                value={qtyBought}
                onChange={(e) => setQtyBought(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Group controlId="formMrp">
              <Form.Label>MRP</Form.Label>
              <Form.Control
                type="number"
                value={mrp}
                readOnly
                required
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="formDiscount">
              <Form.Label>Discount (%)</Form.Label>
              <Form.Control
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <Button variant="primary" onClick={addToCart} className="mt-3">
          Add to cart
        </Button>
      </Form>
      <h3 className="mt-4">Cart</h3>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Qty</th>
            <th>MRP</th>
            <th>Discount</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item, index) => (
            <tr key={index}>
              <td>{item.medicine_name}</td>
              <td>{item.qty_sold}</td>
              <td>{item.mrp.toFixed(2)}</td>
              <td>{item.discount.toFixed(2)}</td>
              <td>{item.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <h4 className="mt-3">Total Amount: ₹{totalAmount.toFixed(2)}</h4>
      <Button variant="success" onClick={generatePDF} className="mt-3">
        Print PDF
      </Button>
    </Container>
  );
};

export default BillingPage;
