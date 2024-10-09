// src/ContactSection.js

import React from 'react';

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
        email: 'be911Kell@htwg-konstanz.de',
    },
    {
        firstName: 'Joschka',
        lastName: 'Peeters',
        email: 'j0741pee@htwg-konstanz.de',
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
