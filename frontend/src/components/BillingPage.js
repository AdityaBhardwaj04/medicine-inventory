import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Table, Alert, Row, Col } from 'react-bootstrap';
import Autocomplete from 'react-autocomplete';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const BillingPage = () => {
  const [cart, setCart] = useState([]);
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [medicineName, setMedicineName] = useState('');
  const [qtyBought, setQtyBought] = useState('');
  const [mrp, setMrp] = useState('');
  const [batchNo, setBatchNo] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [discount, setDiscount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [amountAccepted, setAmountAccepted] = useState('');
  const [medicineOptions, setMedicineOptions] = useState([]);
  const [modeOfPayment, setModeOfPayment] = useState('Cash'); // State to track mode of payment

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

  const fetchMedicineDetails = async (medicineName) => {
    try {
      const response = await fetch(`http://localhost:5000/medicine_details?name=${medicineName}`);
      const data = await response.json();
      if (data.mrp && data.batch_no && data.expiry_date) {
        setMrp(data.mrp);
        setBatchNo(data.batch_no);
        setExpiryDate(data.expiry_date);
      } else {
        setErrorMessage('Failed to fetch medicine details');
      }
    } catch (error) {
      console.error('Error fetching medicine details:', error);
      setErrorMessage('Failed to fetch medicine details');
    }
  };

  const addToCart = () => {
    if (!patientId || !medicineName || !qtyBought || !mrp || !batchNo || !expiryDate) {
      setErrorMessage('All fields are required.');
      return;
    }

    const itemTotal = qtyBought * mrp;

    const newItem = {
      medicine_name: medicineName,
      qty_sold: parseInt(qtyBought),
      mrp: parseFloat(mrp),
      batch_no: batchNo,
      expiry_date: expiryDate,
      amount: parseFloat(itemTotal.toFixed(2)),
    };

    setCart([...cart, newItem]);
    setTotalAmount(totalAmount + itemTotal);

    // Clear input fields
    setMedicineName('');
    setQtyBought('');
    setMrp('');
    setBatchNo('');
    setExpiryDate('');
    setErrorMessage('');
  };

  const handleMedicineSelect = (medicineName) => {
    setMedicineName(medicineName);
    fetchMedicineDetails(medicineName);
  };

  const handleRemoveItem = (index) => {
    const itemToRemove = cart[index];
    setCart(cart.filter((_, i) => i !== index));
    setTotalAmount(totalAmount - itemToRemove.amount);
  };

  const handleEditItem = (index) => {
    const itemToEdit = cart[index];
    setMedicineName(itemToEdit.medicine_name);
    setQtyBought(itemToEdit.qty_sold);
    setMrp(itemToEdit.mrp);
    setBatchNo(itemToEdit.batch_no);
    setExpiryDate(itemToEdit.expiry_date);
    handleRemoveItem(index);
  };

  const saveTransaction = async () => {
    const transactionData = {
      patient_id: patientId,
      patient_name: patientName,
      patient_phone: patientPhone,
      discount: discount,
      amountAccepted: amountAccepted,
      mode_of_payment: modeOfPayment, // Include mode of payment
      medicines: cart.map(item => ({
        medicine_name: item.medicine_name,
        qty_sold: item.qty_sold,
        mrp: item.mrp,
        batch_no: item.batch_no,
        expiry_date: item.expiry_date,
        amount: item.amount
      }))
    };

    try {
      const response = await fetch('http://localhost:5000/billing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(transactionData)
      });

      const result = await response.json();
      if (response.ok) {
        console.log('Transaction saved successfully:', result);
        return true;
      } else {
        console.error('Error saving transaction:', result);
        setErrorMessage('Failed to save transaction.');
        return false;
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      setErrorMessage('Failed to save transaction.');
      return false;
    }
  };

  const calculateDiscountedAmount = () => {
    const totalDiscount = (discount / 100) * totalAmount;
    return totalAmount - totalDiscount;
  };

  const generatePDF = async () => {
    const transactionSaved = await saveTransaction();
    if (!transactionSaved) {
      return;
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a5'
    });
    let yPosition = 20;

    // Title
    doc.setFontSize(18);
    doc.text('Medicine Invoice', 70, yPosition, null, null, 'center');
    yPosition += 10;
    doc.setFontSize(16);
    doc.text('Om Opticals', 70, yPosition, null, null, 'center');
    yPosition += 10;

    // Shop address and phone number
    doc.setFontSize(12);
    doc.text('MIGH-305 Lohia Nagar, Kankarbagh, Patna 800020', 70, yPosition, null, null, 'center');
    yPosition += 10;
    doc.text('Ph no: 9801379003', 70, yPosition, null, null, 'center');
    yPosition += 20;

    // Bill Number, Patient Info, and Date
    doc.setFontSize(12);
    doc.text(`Patient ID: ${patientId}`, 10, yPosition);
    doc.text(`Patient Name: ${patientName}`, 105, yPosition);
    yPosition += 10;
    doc.text(`Patient Phone: ${patientPhone}`, 10, yPosition);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 105, yPosition);
    yPosition += 20;

    // Table headers
    const headers = [['S. No.', 'Particulars', 'Qty', 'MRP', 'Batch No', 'Expiry Date', 'Amount']];

    // Table rows
    const rows = cart.map((item, index) => [
      index + 1,
      item.medicine_name,
      item.qty_sold,
      item.mrp.toFixed(2),
      item.batch_no,
      item.expiry_date,
      item.amount.toFixed(2)
    ]);

    // Auto-table for items
    doc.autoTable({
      startY: yPosition,
      head: headers,
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] },
      margin: { top: 10, right: 10, bottom: 10, left: 10 },
      styles: { fontSize: 10 }
    });

    // Adjust yPosition after the table
    yPosition = doc.autoTable.previous.finalY + 10;

    // Total amount
    const roundedTotalAmount = Math.round(totalAmount);
    const totalDiscount = (discount / 100) * totalAmount;
    const discountedAmount = totalAmount - totalDiscount;
    const change = amountAccepted ? amountAccepted - discountedAmount : 0;
    doc.setFontSize(8);
    doc.text(`Total Amount: ₹${totalAmount.toFixed(2)}`, 10, yPosition);
    yPosition += 7.5;
    doc.text(`Discount: ₹${totalDiscount.toFixed(2)}`, 10, yPosition);
    yPosition += 7.5;
    doc.text(`Discounted Amount: ₹${discountedAmount.toFixed(2)}`, 10, yPosition);
    yPosition += 7.5;
    doc.text(`Rounded Amount: ₹${Math.round(discountedAmount).toFixed(2)}`, 10, yPosition);
    yPosition += 7.5;
    doc.text(`Accepted Amount: ₹${parseFloat(amountAccepted).toFixed(2)}`, 10, yPosition);
    yPosition += 7.5;
    doc.text(`Change: ₹${change.toFixed(2)}`, 10, yPosition);

    // Authorized signatory
    yPosition += 10;
    doc.text('Authorized Signatory', 105, yPosition, null, null, 'center');

    // Save PDF
    doc.save(`Bill_${patientId}.pdf`);
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
            <Form.Group controlId="formPatientName">
              <Form.Label>Patient Name</Form.Label>
              <Form.Control
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="formPatientPhone">
              <Form.Label>Patient Phone Number</Form.Label>
              <Form.Control
                type="text"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
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
        </Row>
        <Button variant="primary" onClick={addToCart} className="mt-3">
          Add to Cart
        </Button>
      </Form>

      <h3 className="mt-4">Patient Info</h3>
      <p>
        Patient ID: {patientId}, Name: {patientName}, Phone: {patientPhone}
      </p>

      <h3 className="mt-4">Cart</h3>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Medicine Name</th>
            <th>Quantity</th>
            <th>MRP</th>
            <th>Batch No</th>
            <th>Expiry Date</th>
            <th>Amount</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{item.medicine_name}</td>
              <td>{item.qty_sold}</td>
              <td>{item.mrp.toFixed(2)}</td>
              <td>{item.batch_no}</td>
              <td>{item.expiry_date}</td>
              <td>{item.amount.toFixed(2)}</td>
              <td>
                <Button variant="warning" onClick={() => handleEditItem(index)}>
                  Edit
                </Button>{' '}
                <Button variant="danger" onClick={() => handleRemoveItem(index)}>
                  Remove
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Row>
        <Col>
          <Form.Group controlId="formDiscountOverall">
            <Form.Label>Overall Discount (%)</Form.Label>
            <Form.Control
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="formAmountAccepted">
            <Form.Label>Amount Accepted</Form.Label>
            <Form.Control
              type="number"
              value={amountAccepted}
              onChange={(e) => setAmountAccepted(e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group controlId="formModeOfPayment">
            <Form.Label>Mode of Payment</Form.Label>
            <div>
              <Form.Check
                type="radio"
                label="Cash"
                name="modeOfPayment"
                value="Cash"
                checked={modeOfPayment === 'Cash'}
                onChange={(e) => setModeOfPayment(e.target.value)}
              />
              <Form.Check
                type="radio"
                label="Online"
                name="modeOfPayment"
                value="Online"
                checked={modeOfPayment === 'Online'}
                onChange={(e) => setModeOfPayment(e.target.value)}
              />
            </div>
          </Form.Group>
        </Col>
      </Row>

      <h4 className="mt-4">Total Amount after Discount: ₹{calculateDiscountedAmount().toFixed(2)}</h4>

      <Button variant="success" onClick={generatePDF} className="mt-3">
        Generate Invoice PDF
      </Button>
    </Container>
  );
};

export default BillingPage;
