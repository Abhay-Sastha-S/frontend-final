import React, { useState, useEffect } from 'react'; // Added useEffect
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import UploadCSVPage from './components/UploadCSVPage';
import ManualEntryPage from './components/ManualEntryPage';
import CampaignResultPage from './components/CampaignResultPage';
import DashboardPage from './components/DashboardPage';
import GenerateCampaignPage from './components/GenerateCampaignPage';
import CollapsiblePane from './components/CollapsiblePane';
import HoverBox from './components/HoverBox';
import Navbar from './components/Navbar';
import './App.css';

const API_BASE_URL = process.env.API_BASE_URL;

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [accounts, setAccounts] = useState([]); // Initially empty
  const [hoverDetails, setHoverDetails] = useState(null); // For hover box

  // Load accounts from the MongoDB server on app load
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/accounts`); // Example endpoint
        if (!response.ok) throw new Error('Failed to fetch accounts.');
        const data = await response.json();
        setAccounts(data);
      } catch (error) {
        console.error('Error fetching accounts:', error);
      }
    };
    fetchAccounts();
  }, []);

  const handleAccountAdded = (newAccount) => {
    setAccounts((prevAccounts) => [...prevAccounts, newAccount]);
  };

  const handleAccountClick = (accountId) => {
    const account = accounts.find((acc) => acc._id === accountId);
    setHoverDetails({ type: 'account', details: account });
  };

  const handleContactClick = (contactId) => {
    const account = accounts.find((acc) =>
      acc.contacts.some((contact) => contact.email === contactId)
    );
    const contact = account.contacts.find((contact) => contact.email === contactId);
    setHoverDetails({ type: 'contact', details: contact });
  };

  const handleCloseHoverBox = () => {
    setHoverDetails(null);
  };

  return (
    <Router>
      <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
        <Navbar toggleDarkMode={() => setDarkMode(!darkMode)} darkMode={darkMode} />
        <div className="app-layout">
          <CollapsiblePane
            apiUrl={API_BASE_URL}
            accounts={accounts}
            onAccountClick={handleAccountClick}
            onContactClick={handleContactClick}
          />
          <div className="content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route
                path="/manual"
                element={
                  <ManualEntryPage
                    apiUrl={API_BASE_URL}
                    onAccountAdded={handleAccountAdded}
                  />
                }
              />
              <Route path="/upload" element={<UploadCSVPage apiUrl={API_BASE_URL} />} />
              <Route path="/dashboard" element={<DashboardPage apiUrl={API_BASE_URL} />} />
              <Route
                path="/generate"
                element={<GenerateCampaignPage accounts={accounts} apiUrl={API_BASE_URL} />}
              />
              <Route path="/results" element={<CampaignResultPage />} />
            </Routes>
            {hoverDetails && (
              <>
                <div className="right-pane-overlay" onClick={handleCloseHoverBox}></div>
                <HoverBox details={hoverDetails} onClose={handleCloseHoverBox} />
              </>
            )}
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
