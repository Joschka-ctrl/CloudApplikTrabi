// src/ContactSection.js

import React from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';


// Daten für die Kontakte
const contacts = [
    {
        firstName: 'Sascha',
        lastName: 'Kiebler',
        email: 'sascha.kiebler@htwg-konstanz.de',
    },
    {
        firstName: 'Ben',
        lastName: 'Keller',
        email: 'be911kel@htwg-konstanz.de',
    },
    {
        firstName: 'Joschka',
        lastName: 'Peeters',
        email: 'j0741pee@htwg-konstanz.de',
    },
];

const ContactSection = () => {
    return (
        <div>
            <h2>Kontakt</h2>
            {contacts.map((contact, index) => (
                <Card key={index} style={{ width: '18rem' }}>
                    <Card.Body >
                        <Card.Title> {contact.firstName} {contact.lastName}</Card.Title>
                        <Card.Text><p>Email: {contact.email}</p></Card.Text>
                        <Button variant="primary">Go somewhere</Button>
                    </Card.Body>
                </Card>
            ))}
        </div>
    );
};

const BasicExample = () => {
    return (
        <Card style={{ width: '18rem' }}>
            <Card.Img variant="top" src="holder.js/100px180" />
            <Card.Body>
                <Card.Title>Card Title</Card.Title>
                <Card.Text>
                    {contacts.map((contact, index) => (
                        <li key={index} >
                            <h3>
                                {contact.firstName} {contact.lastName}
                            </h3>
                            <p>Email: {contact.email}</p>
                        </li>
                    ))}
                </Card.Text>
                <Button variant="primary">Go somewhere</Button>
            </Card.Body>
        </Card>
    );
}

// Stil für die Komponente
const styles = {
    container: {
        padding: '20px',

        borderRadius: '5px',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
    },
    list: {
        listStyleType: 'none',
        padding: 0,
    },
    item: {
        marginBottom: '15px',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
    },
};

export default ContactSection;
