import React, { useState } from 'react';
import './ManualEntryPage.css';

function ManualEntryPage({ apiUrl, onAccountAdded }) {
  const [step, setStep] = useState(1); // Step 1: Account Details, Step 2: Add Contacts
  const [currentAccount, setCurrentAccount] = useState({
    account_name: '',
    industry: '',
    pain_points: '',
    contacts: [],
  });
  const [currentContact, setCurrentContact] = useState({
    name: '',
    email: '',
    job_title: '',
    city: '',
    country: '',
  });

  const handleNextStep = () => {
    if (currentAccount.account_name.trim()) {
      setStep(2);
    } else {
      alert('Please fill in the account details.');
    }
  };

  const handleAddContact = () => {
    setCurrentAccount({
      ...currentAccount,
      contacts: [...currentAccount.contacts, currentContact],
    });
    setCurrentContact({ name: '', email: '', job_title: '', city: '', country: '' });
  };

  const handleAddAccount = async () => {
    const payload = {
      account_name: currentAccount.account_name,
      industry: currentAccount.industry,
      pain_points: currentAccount.pain_points.split(',').map((point) => point.trim()), // Ensure this is a list
      contacts: currentAccount.contacts.map((contact) => ({
        name: contact.name,
        email: contact.email,
        job_title: contact.job_title,
        city: contact.city || '', // Ensure optional fields are handled
        country: contact.country || '',
      })),
      campaign_objective: 'awareness', // Set a default value
    };

    try {
      const response = await fetch(`${apiUrl}/api/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), // Send the prepared payload
      });

      if (!response.ok) {
        const errorText = await response.text(); // Capture backend error response
        console.error('API Error:', errorText);
        throw new Error('Failed to save account.');
      }

      const savedAccount = await response.json();

      // Notify parent component about the new account
      onAccountAdded(savedAccount);

      // Reset the form
      setCurrentAccount({ account_name: '', industry: '', pain_points: '', contacts: [] });
      setStep(1);
      alert('Account saved successfully!');
    } catch (error) {
      console.error('Error saving account:', error);
      alert('Failed to save account.');
    }
  };

  return (
    <div className="manual-entry-page">
      {step === 1 && (
        <div className="account-entry">
          <h3>Enter Account Details</h3>
          <input
            type="text"
            placeholder="Account Name"
            value={currentAccount.account_name}
            onChange={(e) => setCurrentAccount({ ...currentAccount, account_name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Industry"
            value={currentAccount.industry}
            onChange={(e) => setCurrentAccount({ ...currentAccount, industry: e.target.value })}
          />
          <textarea
            placeholder="Pain Points (comma-separated)"
            value={currentAccount.pain_points}
            onChange={(e) => setCurrentAccount({ ...currentAccount, pain_points: e.target.value })}
          ></textarea>
          <button className="button" onClick={handleNextStep}>Next: Add Contacts</button>
        </div>
      )}

      {step === 2 && (
        <div className="contact-entry">
          <h3>{currentAccount.account_name} {'>'} Add Contacts </h3>
          <input
            type="text"
            placeholder="Name"
            value={currentContact.name}
            onChange={(e) => setCurrentContact({ ...currentContact, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            value={currentContact.email}
            onChange={(e) => setCurrentContact({ ...currentContact, email: e.target.value })}
          />
          <input
            type="text"
            placeholder="Job Title"
            value={currentContact.job_title}
            onChange={(e) => setCurrentContact({ ...currentContact, job_title: e.target.value })}
          />
          <input
            type="text"
            placeholder="City"
            value={currentContact.city}
            onChange={(e) => setCurrentContact({ ...currentContact, city: e.target.value })}
          />
          <input
            type="text"
            placeholder="Country"
            value={currentContact.country}
            onChange={(e) => setCurrentContact({ ...currentContact, country: e.target.value })}
          />
          <button className="button" onClick={handleAddContact}>Add Contact</button>
          <button className="button add-account-button" onClick={handleAddAccount}>Save Account</button>
        </div>
      )}
    </div>
  );
}

export default ManualEntryPage;
