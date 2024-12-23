import React, { useState, useEffect } from 'react';
import './DashboardPage.css';

function DashboardPage({ apiUrl }) {
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch(`${apiUrl}/campaigns`);
        const data = await response.json();
        setCampaigns(data);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      }
    };
    fetchCampaigns();
  }, [apiUrl]);

  return (
    <div className="dashboard">
      <h2>Campaign Dashboard</h2>
      <div className="campaign-container">
        {campaigns.map((campaign, idx) => (
          <div key={idx} className="campaign-card">
            <h3>{campaign.account_name}</h3>
            <p><strong>Emails Generated:</strong> {campaign.emails.length}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardPage;
