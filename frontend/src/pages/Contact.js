// src/ContactSection.js

import React from 'react';

// Daten für die Kontakte
const contacts = [
    {
        firstName: 'Max',
        lastName: 'Mustermann',
        email: 'max.mustermann@example.com',
    },
    {
        firstName: 'Erika',
        lastName: 'Musterfrau',
        email: 'erika.musterfrau@example.com',
    },
    {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
    },
];

const ContactSection = () => {
    return (
        <div style={styles.container}>
            <h2>Kontakt</h2>
            <ul style={styles.list}>
                {contacts.map((contact, index) => (
                    <li key={index} style={styles.item}>
                        <h3>
                            {contact.firstName} {contact.lastName}
                        </h3>
                        <p>Email: {contact.email}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

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
