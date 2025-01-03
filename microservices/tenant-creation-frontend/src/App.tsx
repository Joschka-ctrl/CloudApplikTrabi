import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Card } from 'react-bootstrap';

function App() {

  function selectPlan(plan: string) {
    console.log(`Selected plan: ${plan}`)

    const tenantDetails = {
      plan: plan
    }

    fetch('http://localhost:3020/tenant-creation/tenants', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tenantDetails })
    })
  }

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Choose a plan</h2>
      <div className="row">
      <div className="col-md-4">
        <Card>
        <Card.Body>
          <Card.Title>Free</Card.Title>
          <Card.Text>
          $0 / month
          </Card.Text>
          <Card.Text>
          Basic features for personal use.
          </Card.Text>
          <button className="btn btn-primary" onClick={() => selectPlan("free")}>Select</button>
        </Card.Body>
        </Card>
      </div>
      <div className="col-md-4">
        <Card>
        <Card.Body>
          <Card.Title>Standard</Card.Title>
          <Card.Text>
          $10 / month
          </Card.Text>
          <Card.Text>
          Advanced features for small teams.
          </Card.Text>
          <button className="btn btn-primary" onClick={() => selectPlan("standard")}>Select</button>
        </Card.Body>
        </Card>
      </div>
      <div className="col-md-4">
        <Card>
        <Card.Body>
          <Card.Title>Enterprise</Card.Title>
          <Card.Text>
          $50 / month
          </Card.Text>
          <Card.Text>
          All features for large organizations.
          </Card.Text>
          <button className="btn btn-primary" onClick={() => selectPlan("enterprise")}>Select</button>
        </Card.Body>
        </Card>
      </div>
      </div>
    </div>
  )
}

export default App
