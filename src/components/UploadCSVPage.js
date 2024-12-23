import React, { useState } from 'react';
import './UploadCSVPage.css';

function UploadCSVPage({ apiUrl }) {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${apiUrl}/upload_csv`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      alert('CSV uploaded and processed successfully!');
    } catch (error) {
      console.error('Error uploading CSV:', error);
      alert('Failed to upload CSV.');
    }
  };

  return (
    <div className="upload-page">
      <input type="file" onChange={handleFileChange} />
      <button className="button" onClick={handleUpload}>Upload CSV</button>
    </div>
  );
}

export default UploadCSVPage;
