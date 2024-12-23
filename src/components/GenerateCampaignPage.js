import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import './GenerateCampaignPage.css';

function GenerateCampaignPage({ accounts, apiUrl }) {
  const [step, setStep] = useState(1); // Step state
  const [userDetails, setUserDetails] = useState({ name: '', role: '' });
  const [currentAccount, setCurrentAccount] = useState(null);
  const [currentContacts, setCurrentContacts] = useState([]); // Dynamically loaded contacts
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [campaignSettings, setCampaignSettings] = useState({
    number_of_emails: 1,
    languages: ['en'],
    guidelines: '',
    sentiment: 'neutral',
  });

  const navigate = useNavigate(); // Hook for navigation

  const handleSelectAccount = async (accountName) => {
    const account = accounts.find((account) => account.account_name === accountName);
    if (account) {
      setCurrentAccount(account);

      // Fetch contacts dynamically using account_name
      try {
        const response = await fetch(`${apiUrl}/api/contacts?account_name=${encodeURIComponent(accountName)}`);
        if (!response.ok) throw new Error('Failed to fetch contacts.');
        const contacts = await response.json();
        setCurrentContacts(Array.isArray(contacts) ? contacts : []); // Ensure contacts is an array
      } catch (error) {
        console.error('Error fetching contacts:', error);
        setCurrentContacts([]); // Fallback to empty array if fetch fails
      }
    }
  };

  const handleToggleContact = (contactEmail) => {
    setSelectedContacts((prev) =>
      prev.includes(contactEmail) ? prev.filter((email) => email !== contactEmail) : [...prev, contactEmail]
    );
  };

  const handleToggleLanguage = (lang) => {
    setCampaignSettings((prev) => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter((l) => l !== lang)
        : [...prev.languages, lang],
    }));
  };

  const handleRemoveLanguage = (lang) => {
    setCampaignSettings((prev) => ({
      ...prev,
      languages: prev.languages.filter((l) => l !== lang),
    }));
  };

  const handleAddAccount = () => {
    if (currentAccount) {
      const selectedContactsForAccount = currentContacts.filter((contact) =>
        selectedContacts.includes(contact.email)
      );
  
      if (selectedContactsForAccount.length > 0) {
        const accountWithContacts = {
          account_name: currentAccount.account_name,
          industry: currentAccount.industry,
          pain_points: currentAccount.pain_points,
          contacts: selectedContactsForAccount,
        };
        setSelectedAccounts([...selectedAccounts, accountWithContacts]);
        setSelectedContacts([]); // Reset selected contacts for this account
        setCurrentAccount(null); // Return to account selection
      } else {
        alert("Please select at least one contact before adding the account.");
      }
    }
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleGenerateCampaign = async () => {
    setIsLoading(true); // Show loading overlay
    const payload = {
      accounts: selectedAccounts,
      number_of_emails: campaignSettings.number_of_emails,
      languages: campaignSettings.languages,
      user_name: userDetails.name,
      user_designation: userDetails.role,
      guidelines: campaignSettings.guidelines,
      sentiment: campaignSettings.sentiment,
    };
  
    try {
      const response = await fetch(`${apiUrl}/generate_campaign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      setIsLoading(false); // Hide loading overlay
      navigate("/results", { state: { campaigns: result.campaigns } }); // Redirect to results page with campaigns
    } catch (error) {
      setIsLoading(false); // Hide loading overlay
      console.error("Error generating campaign:", error);
      alert("Failed to generate campaign.");
    }
  };

  const filteredAccounts = accounts.filter((account) =>
    account.account_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="generate-campaign-page">
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-box">
            <p>This may take some time. Generating emails...</p>
          </div>
        </div>
      )}
      <div className="progress-bar">
        <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>User Role</div>
        <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>Select Target</div>
        <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>Settings</div>
      </div>

      {step === 1 && (
        <div className="user-details">
          <h3>User Details</h3>
          <input
            type="text"
            placeholder="Your Name"
            value={userDetails.name}
            onChange={(e) => setUserDetails({ ...userDetails, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Your Role"
            value={userDetails.role}
            onChange={(e) => setUserDetails({ ...userDetails, role: e.target.value })}
          />
          <button className="button" onClick={handleNext}>Next</button>
        </div>
      )}

      {step === 2 && (
        <div className="account-contact-selection">
          {!currentAccount ? (
            <>
              <h3>Select an Account</h3>
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Search accounts"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="account-grid">
                {filteredAccounts.map((account) => (
                  <div
                    key={account.account_name} // Use account_name as the key
                    className="account-card"
                    onClick={() => handleSelectAccount(account.account_name)} // Pass account_name
                  >
                    <h4>{account.account_name}</h4>
                    <p><strong>Industry:</strong> {account.industry}</p>
                    <p><strong>Contacts:</strong> {account.contacts.length}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="contacts-header">
                <button className="back-arrow" onClick={() => setCurrentAccount(null)}>
                  ←
                </button>
                <h2>{currentAccount.account_name} {'>'} Select Contacts</h2>
              </div>
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Search contacts"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="contacts-grid">
                {currentContacts
                  .filter((contact) =>
                    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    contact.email.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((contact) => (
                    <div
                      key={contact.email} // Use email as a unique identifier
                      className={`contact-card ${selectedContacts.includes(contact.email) ? 'selected' : ''}`}
                      onClick={() => handleToggleContact(contact.email)} // Use email for selection
                    >
                      <h4>{contact.name}</h4>
                      <p><strong>Email:</strong> {contact.email}</p>
                      <p><strong>Job Title:</strong> {contact.job_title}</p>
                    </div>
                  ))}
              </div>
              <button className="button add-account-button" onClick={handleAddAccount}>
                Add Selected Contacts
              </button>
            </>
          )}
          <div className="navigation-buttons">
            <button className="button" onClick={handleBack}>Back</button>
            <button
              className="button"
              onClick={handleNext}
              disabled={selectedAccounts.length === 0}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="campaign-settings">
          <h3>Campaign Settings</h3>
          <label>Number of Emails</label>
          <input
            type="number"
            value={campaignSettings.number_of_emails}
            onChange={(e) =>
              setCampaignSettings({
                ...campaignSettings,
                number_of_emails: parseInt(e.target.value),
              })
            }
          />

          <label>Languages</label>
          <div className="multi-select-dropdown">
            <div className="selected-options">
              {campaignSettings.languages.map((lang) => (
                <span key={lang} className="selected-option">
                  {lang} <button onClick={() => handleRemoveLanguage(lang)}>×</button>
                </span>
              ))}
            </div>
            <div className="dropdown-options">
              {[
                { value: "en", label: "English" },
                { value: "fr", label: "French" },
                { value: "de", label: "German" },
                { value: "es", label: "Spanish" },
                { value: "it", label: "Italian" },
                { value: "pt", label: "Portuguese" },
                { value: "zh", label: "Chinese" },
                { value: "ja", label: "Japanese" },
                { value: "ko", label: "Korean" },
                { value: "ar", label: "Arabic" },
                { value: "hi", label: "Hindi" },
              ].map((lang) => (
                <label key={lang.value}>
                  <input
                    type="checkbox"
                    value={lang.value}
                    checked={campaignSettings.languages.includes(lang.value)}
                    onChange={() => handleToggleLanguage(lang.value)}
                  />
                  {lang.label}
                </label>
              ))}
            </div>
          </div>

          <label>Guidelines</label>
          <textarea
            value={campaignSettings.guidelines}
            onChange={(e) =>
              setCampaignSettings({
                ...campaignSettings,
                guidelines: e.target.value,
              })
            }
          ></textarea>

          <label>Sentiment</label>
          <textarea
            value={campaignSettings.sentiment}
            onChange={(e) =>
              setCampaignSettings({
                ...campaignSettings,
                sentiment: e.target.value,
              })
            }
          >
          </textarea>

          <div className="navigation-buttons">
            <button className="button" onClick={handleBack}>Back</button>
            <button className="button generate-button" onClick={handleGenerateCampaign}>
              Generate Campaign
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GenerateCampaignPage;
