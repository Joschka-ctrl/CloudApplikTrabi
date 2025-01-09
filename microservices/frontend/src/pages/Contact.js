// src/ContactSection.js

import React from 'react';


import { Card, Button, Row, Col, Container } from 'react-bootstrap';


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
        email: 'jo741pee@htwg-konstanz.de',
    },
];



const ContactSection = () => {
    return (
        <Container className="mt-5">
            <Row className="mt-5">
            <h2 className="mt-5">Kontakt</h2>
            </Row>
            
            <Row>
                {contacts.map((contact, index) => (
                    <Col key={index} xs={12} sm={12} md={6} lg={4} className="mb-4">
                        <Card style={{ width: '18rem' }}>
                            <Card.Body>
                                <Card.Title>{contact.firstName} {contact.lastName}</Card.Title>
                                <Card.Text style={{ minHeight: '100px' }}>
                                   Email: {contact.email}
                                </Card.Text>
                                <Button
                                    variant="primary"
                                    onClick={() => handleEmailClick(contact.email)}
                                >
                                    E-Mail senden
                                </Button>
                                
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

const handleEmailClick = (email) => {
    console.log(email);
    window.location.href = `mailto:${email}?subject=Kontaktaufnahme,`;
}; 
export default ContactSection;