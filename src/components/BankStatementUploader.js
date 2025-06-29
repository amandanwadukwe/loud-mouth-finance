import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/BankStatementUploader.css'; // Assuming you'll create this CSS file

const BankStatementUploader = () => {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  // Clean up object URLs when component unmounts or files change
  useEffect(() => {
    return () => {
      previews.forEach(preview => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Filter only valid image types
    const imageFiles = selectedFiles.filter(file => 
      file.type.match('image/jpeg') || file.type.match('image/png')
    );

    if (imageFiles.length < selectedFiles.length) {
      setError('Some files were skipped. Only JPEG and PNG images are allowed.');
    } else {
      setError(null);
    }

    setFiles(imageFiles);

    // Create preview URLs
    const filePreviews = imageFiles.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file)
    }));
    
    // Clean up previous preview URLs
    previews.forEach(preview => URL.revokeObjectURL(preview.url));
    setPreviews(filePreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (files.length === 0) {
      setError('Please select at least one image file');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSummary(null);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      const response = await axios.post(
        'http://localhost:5000/api/summarize-bank-statement', // Updated correct endpoint
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setSummary(response.data);
    } catch (err) {
      console.error('Error processing statement:', err);
      setError(err.response?.data?.error || 
               err.message || 
               'Failed to process bank statement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFile = (index) => {
    // Remove file from files array
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);

    // Revoke object URL and remove from previews
    URL.revokeObjectURL(previews[index].url);
    const newPreviews = [...previews];
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  return (
    <div className="bank-statement-uploader">
      <h1 className="uploader-title">Bank Statement Analyzer</h1>
      <p className="uploader-description">
        Upload images of your bank statements to get an instant analysis of your income, expenses, and transaction patterns.
      </p>
      
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label htmlFor="file-input" className="file-input-label">
            <span className="label-text">Upload Bank Statement Screenshots (JPEG/PNG)</span>
            <span className="file-input-icon">📁</span>
          </label>
          <input
            id="file-input"
            type="file"
            multiple
            accept="image/jpeg, image/png"
            onChange={handleFileChange}
            className="file-input"
          />
          <p className="file-input-help">
            Your files are processed securely. We do not store your bank statements.
          </p>
        </div>

        {previews.length > 0 && (
          <div className="preview-container">
            <h3 className="preview-title">Selected Files:</h3>
            <div className="preview-grid">
              {previews.map((preview, index) => (
                <div key={index} className="preview-item">
                  <button 
                    type="button" 
                    className="remove-file-button"
                    onClick={() => handleRemoveFile(index)}
                    aria-label="Remove file"
                  >
                    ×
                  </button>
                  <img
                    src={preview.url}
                    alt={preview.name}
                    className="preview-image"
                  />
                  <span className="preview-filename">{preview.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || files.length === 0}
          className={`submit-button ${isLoading || files.length === 0 ? 'disabled' : ''}`}
        >
          {isLoading ? (
            <>
              <span className="spinner"></span>
              Processing...
            </>
          ) : 'Analyze Statements'}
        </button>
      </form>

      {error && (
        <div className="error-message">
          <p className="error-title">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {summary && (
        <div className="summary-container">
          <h2 className="summary-title">Statement Summary</h2>
          
          <div className="summary-grid">
            <div className="summary-card">
              <h3 className="summary-card-title">Total Income</h3>
              <p className="summary-card-value income">{formatCurrency(summary.totalIncome)}</p>
            </div>
            
            <div className="summary-card">
              <h3 className="summary-card-title">Total Expenses</h3>
              <p className="summary-card-value expense">{formatCurrency(summary.totalExpenses)}</p>
            </div>
            
            <div className="summary-card">
              <h3 className="summary-card-title">Net Cash Flow</h3>
              <p className={`summary-card-value ${summary.totalIncome - summary.totalExpenses >= 0 ? 'income' : 'expense'}`}>
                {formatCurrency(summary.totalIncome - summary.totalExpenses)}
              </p>
            </div>
            
            <div className="summary-card">
              <h3 className="summary-card-title">Transaction Count</h3>
              <p className="summary-card-value">{summary.transactionCount}</p>
            </div>
          </div>

          <div className="transaction-types">
            <h3 className="section-title">Frequent Transaction Types</h3>
            {summary.frequentTransactionTypes?.length > 0 ? (
              <div className="tags-container">
                {summary.frequentTransactionTypes.map((type, index) => (
                  <span key={index} className="transaction-tag">
                    {type}
                  </span>
                ))}
              </div>
            ) : (
              <p className="no-data">No frequent transaction types identified</p>
            )}
          </div>

          {summary.unusualTransactions?.length > 0 && (
            <div className="unusual-transactions">
              <h3 className="section-title">Unusual Transactions</h3>
              <div className="table-container">
                <table className="transactions-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.unusualTransactions.map((transaction, index) => (
                      <tr key={index}>
                        <td>{transaction.description}</td>
                        <td className={`transaction-amount ${transaction.amount < 0 ? 'expense' : 'income'}`}>
                          {formatCurrency(transaction.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="insights-section">
            <h3 className="section-title">Financial Insights</h3>
            <div className="insights-container">
              {summary.totalIncome > summary.totalExpenses ? (
                <div className="insight positive">
                  <span className="insight-icon">✅</span>
                  <p>Your income exceeds your expenses by {formatCurrency(summary.totalIncome - summary.totalExpenses)}, which is positive for your financial health.</p>
                </div>
              ) : (
                <div className="insight negative">
                  <span className="insight-icon">⚠️</span>
                  <p>Your expenses exceed your income by {formatCurrency(Math.abs(summary.totalIncome - summary.totalExpenses))}, which may be a concern.</p>
                </div>
              )}
              
              {/* Additional insights based on transaction data */}
              {summary.frequentTransactionTypes?.includes("Dining") && (
                <div className="insight neutral">
                  <span className="insight-icon">🍽️</span>
                  <p>You have frequent dining expenses. Consider setting a budget for eating out.</p>
                </div>
              )}
            </div>
          </div>

          <div className="raw-json">
            <h3 className="section-title">Raw JSON Data</h3>
            <pre className="json-container">
              {JSON.stringify(summary, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankStatementUploader;