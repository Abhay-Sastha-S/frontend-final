import React from 'react';
import './HoverBox.css';

function HoverBox({ details, onClose }) {
  return (
    <div className="hover-box">
      <button className="close-button" onClick={onClose}>✖</button>
      {details.type === 'account' ? (
        <>
          <h2>Account: {details.details.account_name}</h2>
          <p>Industry: {details.details.industry || 'N/A'}</p>
          <h3>Contacts:</h3>
          <ul>
            {details.details.contacts.map((contact) => (
              <li key={contact.id}>{contact.name}</li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <h2>Contact: {details.details.name}</h2>
          <p>Email: {details.details.email}</p>
          <p>Job Title: {details.details.job_title}</p>
        </>
      )}
    </div>
  );
}

export default HoverBox;
