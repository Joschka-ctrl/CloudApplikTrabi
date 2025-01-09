import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Card, Modal, Button, Form, InputGroup, FormControl } from 'react-bootstrap';
import { useState } from 'react';

function App() {
  const [showModal, setShowModal] = useState(false); // Modal visibility state
  const [selectedPlan, setSelectedPlan] = useState(''); // Selected plan state
  const [tenantName, setTenantName] = useState(''); // Tenant name state
  const [emails, setEmails] = useState(['']); // Emails state (with initial one input)

  // Function to handle plan selection and show the modal
  function selectPlan(plan: string) {
    console.log(`Selected plan: ${plan}`);
    setSelectedPlan(plan);
    setShowModal(true); // Show modal when plan is selected
  }

  // Handle email field changes
  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  // Add a new email input field
  const handleAddEmail = () => {
    setEmails([...emails, '']);
  };

  // Remove an email input field
  const handleRemoveEmail = (index: number) => {
    const newEmails = emails.filter((_, i) => i !== index);
    setEmails(newEmails);
  };

  // Submit form (no fetch for now)
  const handleSubmit = () => {
    console.log({
      tenantName,
      selectedPlan,
      emails: emails.filter(email => email !== ''),
    });

    // fetch auf neue Route 
    fetch('http://localhost:3023/api/tenants', {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json',
      },
      body: JSON.stringify({
      tenantName: tenantName.toLowerCase(),
      plan: selectedPlan.toLowerCase(),
      emails: emails.filter(email => email !== '').map(email => email.toLowerCase()),
      }),
    })
 
    // Close the modal after submission
    setShowModal(false);
    setTenantName('');
    setEmails(['']);
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Choose a plan</h2>
      <div className="row">
        <div className="col-md-4">
          <Card>
            <Card.Body>
              <Card.Title>Free</Card.Title>
              <Card.Text>$0 / month</Card.Text>
              <Card.Text>Basic features for personal use.</Card.Text>
              <button className="btn btn-primary" onClick={() => selectPlan('free')}>
                Select
              </button>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-4">
          <Card>
            <Card.Body>
              <Card.Title>Standard</Card.Title>
              <Card.Text>$10 / month</Card.Text>
              <Card.Text>Advanced features for small teams.</Card.Text>
              <button className="btn btn-primary" onClick={() => selectPlan('standard')}>
                Select
              </button>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-4">
          <Card>
            <Card.Body>
              <Card.Title>Enterprise</Card.Title>
              <Card.Text>$50 / month</Card.Text>
              <Card.Text>All features for large organizations.</Card.Text>
              <button className="btn btn-primary" onClick={() => selectPlan('enterprise')}>
                Select
              </button>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Modal for Tenant Creation */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Tenant</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="tenantName">
              <Form.Label>Tenant Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter tenant name"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="emails">
              <Form.Label>Email Addresses</Form.Label>
              {emails.map((email, index) => (
                <InputGroup key={index} className="mb-3">
                  <FormControl
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => handleEmailChange(index, e.target.value)}
                  />
                  <InputGroup.Text>
                    <Button
                      variant="danger"
                      onClick={() => handleRemoveEmail(index)}
                      disabled={emails.length === 1}
                    >
                      Remove
                    </Button>
                  </InputGroup.Text>
                </InputGroup>
              ))}
              <Button variant="secondary" onClick={handleAddEmail}>
                Add Email
              </Button>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Create Tenant
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default App;
