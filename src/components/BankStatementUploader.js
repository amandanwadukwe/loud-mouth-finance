import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/BankStatementUploader.css';

const BankStatementUploader = () => {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

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
        'https://amandanwadukwe.a2hosted.com/loud-mouth-finance/api/summarize-bank-statement',
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const toggleCategory = (category) => {
    if (activeCategory === category) {
      setActiveCategory(null);
    } else {
      setActiveCategory(category);
    }
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
          
          {summary.statementPeriod && (
            <div className="statement-period">
              <h3 className="section-title">Statement Period</h3>
              <p className="period-dates">
                {formatDate(summary.statementPeriod.startDate)} - {formatDate(summary.statementPeriod.endDate)}
              </p>
            </div>
          )}
          
          <div className="summary-grid">
            <div className="summary-card">
              <h3 className="summary-card-title">Total Income</h3>
              <p className="summary-card-value income">{formatCurrency(summary.summary?.totalIncome || summary.totalIncome)}</p>
            </div>
            
            <div className="summary-card">
              <h3 className="summary-card-title">Total Expenses</h3>
              <p className="summary-card-value expense">{formatCurrency(summary.summary?.totalExpenses || summary.totalExpenses)}</p>
            </div>
            
            <div className="summary-card">
              <h3 className="summary-card-title">Net Cash Flow</h3>
              <p className={`summary-card-value ${(summary.summary?.netCashflow || (summary.summary?.totalIncome - summary.summary?.totalExpenses) || (summary.totalIncome - summary.totalExpenses)) >= 0 ? 'income' : 'expense'}`}>
                {formatCurrency(summary.summary?.netCashflow || (summary.summary?.totalIncome - summary.summary?.totalExpenses) || (summary.totalIncome - summary.totalExpenses))}
              </p>
            </div>
            
            <div className="summary-card">
              <h3 className="summary-card-title">Transaction Count</h3>
              <p className="summary-card-value">{summary.summary?.transactionCount || summary.transactionCount}</p>
            </div>
            
            {summary.summary?.averageTransaction && (
              <div className="summary-card">
                <h3 className="summary-card-title">Average Transaction</h3>
                <p className="summary-card-value">{formatCurrency(summary.summary.averageTransaction)}</p>
              </div>
            )}
          </div>

          {/* Categorized Transactions Section */}
          {summary.categorizedTransactions && (
            <div className="transactions-section">
              <h3 className="section-title">Transaction Categories</h3>
              
              <div className="category-tabs">
                {Object.keys(summary.categorizedTransactions).map(category => (
                  summary.categorizedTransactions[category].length > 0 && (
                    <button 
                      key={category}
                      className={`category-tab ${activeCategory === category ? 'active' : ''}`}
                      onClick={() => toggleCategory(category)}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                      <span className="category-count">{summary.categorizedTransactions[category].length}</span>
                    </button>
                  )
                ))}
              </div>
              
              {activeCategory && summary.categorizedTransactions[activeCategory]?.length > 0 && (
                <div className="category-transactions">
                  <div className="table-container">
                    <table className="transactions-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Description</th>
                          <th>Amount</th>
                          {activeCategory === 'subscriptions' && <th>Frequency</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {summary.categorizedTransactions[activeCategory].map((transaction, index) => (
                          <tr key={index}>
                            <td>{formatDate(transaction.date)}</td>
                            <td>{transaction.description}</td>
                            <td className={`transaction-amount ${transaction.amount < 0 ? 'expense' : 'income'}`}>
                              {formatCurrency(transaction.amount)}
                            </td>
                            {activeCategory === 'subscriptions' && <td>{transaction.frequency}</td>}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Legacy display for frequentTransactionTypes if using old data structure */}
          {!summary.categorizedTransactions && summary.frequentTransactionTypes?.length > 0 && (
            <div className="transaction-types">
              <h3 className="section-title">Frequent Transaction Types</h3>
              <div className="tags-container">
                {summary.frequentTransactionTypes.map((type, index) => (
                  <span key={index} className="transaction-tag">
                    {type}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Top Expense Categories Section */}
          {summary.insights?.topExpenseCategories?.length > 0 && (
            <div className="insights-section">
              <h3 className="section-title">Top Expense Categories</h3>
              <div className="expense-categories">
                {summary.insights.topExpenseCategories.map((category, index) => (
                  <div key={index} className="expense-category">
                    <div className="category-header">
                      <span className="category-name">{category.category}</span>
                      <span className="category-amount">{formatCurrency(category.amount)}</span>
                    </div>
                    <div className="category-bar-container">
                      <div 
                        className="category-bar" 
                        style={{width: `${category.percentOfTotal}%`}}
                      ></div>
                    </div>
                    <span className="category-percent">{category.percentOfTotal.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unusual Transactions Section */}
          {(summary.insights?.unusualTransactions?.length > 0 || summary.unusualTransactions?.length > 0) && (
            <div className="unusual-transactions">
              <h3 className="section-title">Unusual Transactions</h3>
              <div className="table-container">
                <table className="transactions-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Amount</th>
                      {summary.insights?.unusualTransactions?.[0]?.reason && <th>Reason</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {(summary.insights?.unusualTransactions || summary.unusualTransactions).map((transaction, index) => (
                      <tr key={index}>
                        <td>{formatDate(transaction.date)}</td>
                        <td>{transaction.description}</td>
                        <td className={`transaction-amount ${transaction.amount < 0 ? 'expense' : 'income'}`}>
                          {formatCurrency(transaction.amount)}
                        </td>
                        {transaction.reason && <td>{transaction.reason}</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recurring Payments Section */}
          {summary.insights?.recurringPayments?.length > 0 && (
            <div className="recurring-payments">
              <h3 className="section-title">Recurring Payments</h3>
              <div className="table-container">
                <table className="transactions-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Frequency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.insights.recurringPayments.map((payment, index) => (
                      <tr key={index}>
                        <td>{payment.description}</td>
                        <td className="transaction-amount expense">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td>{payment.frequency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Savings Opportunities Section */}
          {summary.insights?.savingsOpportunities?.length > 0 && (
            <div className="savings-opportunities">
              <h3 className="section-title">Savings Opportunities</h3>
              <div className="opportunities-container">
                {summary.insights.savingsOpportunities.map((opportunity, index) => (
                  <div key={index} className="opportunity-card">
                    <div className="opportunity-header">
                      <span className="opportunity-category">{opportunity.category}</span>
                      <span className="opportunity-amount">{formatCurrency(opportunity.potentialSavings)}</span>
                    </div>
                    <p className="opportunity-suggestion">{opportunity.suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* General Financial Insights */}
          <div className="insights-section">
            <h3 className="section-title">Financial Insights</h3>
            <div className="insights-container">
              {(summary.summary?.totalIncome || summary.totalIncome) > (summary.summary?.totalExpenses || summary.totalExpenses) ? (
                <div className="insight positive">
                  <span className="insight-icon">✅</span>
                  <p>Your income exceeds your expenses by {formatCurrency((summary.summary?.totalIncome || summary.totalIncome) - (summary.summary?.totalExpenses || summary.totalExpenses))}, which is positive for your financial health.</p>
                </div>
              ) : (
                <div className="insight negative">
                  <span className="insight-icon">⚠️</span>
                  <p>Your expenses exceed your income by {formatCurrency(Math.abs((summary.summary?.totalIncome || summary.totalIncome) - (summary.summary?.totalExpenses || summary.totalExpenses)))}, which may be a concern.</p>
                </div>
              )}
              
              {summary.categorizedTransactions?.subscriptions?.length > 0 && (
                <div className="insight neutral">
                  <span className="insight-icon">🔄</span>
                  <p>You have {summary.categorizedTransactions.subscriptions.length} active subscriptions totaling {formatCurrency(summary.categorizedTransactions.subscriptions.reduce((sum, sub) => sum + Math.abs(sub.amount), 0))} per month.</p>
                </div>
              )}
              
              {summary.categorizedTransactions?.dining?.length > 0 && (
                <div className="insight neutral">
                  <span className="insight-icon">🍽️</span>
                  <p>You spent {formatCurrency(summary.categorizedTransactions.dining.reduce((sum, item) => sum + Math.abs(item.amount), 0))} on dining out.</p>
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