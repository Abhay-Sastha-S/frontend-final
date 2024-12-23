import React, { useState } from 'react';
import './CollapsiblePane.css';

function CollapsiblePane({ accounts, onAccountClick, onContactClick }) {
  const [expandedAccountId, setExpandedAccountId] = useState(null); // Tracks the currently expanded account
  const [searchTerm, setSearchTerm] = useState('');

  // Filter accounts dynamically based on the search term
  const filteredAccounts = accounts.filter((account) => {
    const matchesAccount = account.account_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesContact = account.contacts.some((contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return matchesAccount || matchesContact;
  });

  const handleAccountToggle = (accountId) => {
    // Toggle the expanded state for the selected account
    setExpandedAccountId((prevId) => (prevId === accountId ? null : accountId));
    if (onAccountClick) {
      onAccountClick(accountId);
    }
  };

  return (
    <div className="collapsible-pane">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search accounts or contacts"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <ul className="accounts-list">
        {filteredAccounts.map((account) => (
          <li key={account._id}>
            <div
              className={`account-item ${expandedAccountId === account._id ? 'expanded' : ''}`}
              onClick={() => handleAccountToggle(account._id)}
            >
              {account.account_name}
              <span>{expandedAccountId === account._id ? '-' : '+'}</span>
            </div>
            {/* Only render contacts if this account is expanded */}
            <ul className={`contacts-list ${expandedAccountId === account._id ? 'expanded' : ''}`}>
              {account.contacts.map((contact) => (
                <li key={contact.email} className="contact-item">
                  <div onClick={() => onContactClick && onContactClick(contact.email)}>
                    {contact.name}
                  </div>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CollapsiblePane;
