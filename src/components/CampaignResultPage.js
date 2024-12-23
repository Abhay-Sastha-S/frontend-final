import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./CampaignResultPage.css";

function CampaignResultPage({ apiUrl }) {
  const location = useLocation();
  const [campaigns, setCampaigns] = useState(location.state?.campaigns || []); // Initialize with passed campaigns
  const [selectedAccount, setSelectedAccount] = useState(null); // Selected account name
  const [selectedContact, setSelectedContact] = useState("all"); // Selected contact name
  const [selectedLanguage, setSelectedLanguage] = useState("all"); // Selected language
  const [responseIndex, setResponseIndex] = useState(0); // Current response index

  // Fetch campaigns if not passed in location state
  useEffect(() => {
    if (!campaigns.length) {
      const fetchCampaigns = async () => {
        try {
          const response = await fetch(`${apiUrl}/campaigns`);
          if (!response.ok) throw new Error("Failed to fetch campaigns.");
          const data = await response.json();
          setCampaigns(data);
        } catch (error) {
          console.error("Error fetching campaigns:", error);
        }
      };
      fetchCampaigns();
    }
  }, [campaigns, apiUrl]);

  // Extract unique contact names for the selected account
  const getUniqueContacts = () => {
    const account = campaigns.find((c) => c.account_name === selectedAccount);
    if (!account || !account.contacts) return [];
    return [...new Set(account.contacts.map((contact) => contact.contact_name))];
  };

  // Extract unique languages for the selected account and contact
  const getUniqueLanguages = () => {
    const account = campaigns.find((c) => c.account_name === selectedAccount);
    if (!account || !account.contacts) return [];

    const emails = account.contacts
      .filter((contact) => selectedContact === "all" || contact.contact_name === selectedContact)
      .flatMap((contact) => contact.emails || []);

    return [...new Set(emails.map((email) => email.language))];
  };

  // Query emails based on selected filters
  const getFilteredEmails = () => {
    const account = campaigns.find((c) => c.account_name === selectedAccount);
    if (!account || !account.contacts) return [];

    const emails = account.contacts
      .filter((contact) => selectedContact === "all" || contact.contact_name === selectedContact)
      .flatMap((contact) => contact.emails || []);

    return emails.filter(
      (email) =>
        (selectedLanguage === "all" || email.language === selectedLanguage)
    );
  };

  const filteredEmails = getFilteredEmails();

  return (
    <div className="result-page">
      <div className="filters-pane">
        <h3>Filters</h3>
        <label>
          Select Account:
          <select
            value={selectedAccount || ""}
            onChange={(e) => {
              setSelectedAccount(e.target.value || null);
              setSelectedContact("all");
              setSelectedLanguage("all");
              setResponseIndex(0);
            }}
          >
            <option value="">-- Select an Account --</option>
            {campaigns.map((campaign) => (
              <option key={campaign.account_name} value={campaign.account_name}>
                {campaign.account_name}
              </option>
            ))}
          </select>
        </label>

        {selectedAccount && (
          <>
            <label>
              Select Contact:
              <select
                value={selectedContact}
                onChange={(e) => {
                  setSelectedContact(e.target.value);
                  setSelectedLanguage("all");
                  setResponseIndex(0);
                }}
              >
                <option value="all">All Contacts</option>
                {getUniqueContacts().map((contact) => (
                  <option key={contact} value={contact}>
                    {contact}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Select Language:
              <select
                value={selectedLanguage}
                onChange={(e) => {
                  setSelectedLanguage(e.target.value);
                  setResponseIndex(0);
                }}
              >
                <option value="all">All Languages</option>
                {getUniqueLanguages().map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
      </div>

      <div className="response-pane">
        {filteredEmails.length > 0 ? (
          <>
            <h3>{filteredEmails[responseIndex]?.contact_name}</h3>
            <div className="email-details">
              <p>
                <strong>Language:</strong> {filteredEmails[responseIndex]?.language}
              </p>
              <p>
                <strong>Subject:</strong> {filteredEmails[responseIndex]?.subject}
              </p>
              <p>
                <strong>Body:</strong> {filteredEmails[responseIndex]?.call_to_action}
              </p>
            </div>
            <div className="response-navigation">
              <button
                onClick={() => setResponseIndex((prev) => Math.max(0, prev - 1))}
                disabled={responseIndex === 0}
              >
                ← Previous
              </button>
              <button
                onClick={() =>
                  setResponseIndex((prev) => Math.min(filteredEmails.length - 1, prev + 1))
                }
                disabled={responseIndex === filteredEmails.length - 1}
              >
                Next →
              </button>
            </div>
          </>
        ) : (
          <p>No emails found for the selected criteria.</p>
        )}
      </div>
    </div>
  );
}

export default CampaignResultPage;
