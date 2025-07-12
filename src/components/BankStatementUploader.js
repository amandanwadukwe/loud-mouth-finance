import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import { v4 as uuidv4 } from 'uuid';
import '../styles/BankStatementUploader.css';

const BankStatementUploader = () => {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editingUnusualTransaction, setEditingUnusualTransaction] = useState(null);
  const [editingValues, setEditingValues] = useState({});
  
  // History tracking for undo/redo functionality
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isUndoRedoAction, setIsUndoRedoAction] = useState(false);
  
  // Define all possible categories to ensure empty ones are included
  const allCategories = [
    'income', 'subscriptions', 'groceries', 'dining', 'transportation',
    'utilities', 'shopping', 'entertainment', 'transfers', 'bnpl', 'other'
  ];
  
  const reportRef = useRef(null);
  
  // Clean up object URLs when component unmounts or files change
  useEffect(() => {
    return () => {
      previews.forEach(preview => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  // Add transaction to history when summary changes
  useEffect(() => {
    if (summary && !isUndoRedoAction) {
      // Add current state to history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(summary)));
      
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
    
    // Reset undo/redo flag
    if (isUndoRedoAction) {
      setIsUndoRedoAction(false);
    }
  }, [summary]);

  // Process API response to add unique IDs and enforce amount rules
  const processApiResponse = useCallback((responseData) => {
    const processedData = { ...responseData };
    
    // Ensure categorizedTransactions exists
    if (!processedData.categorizedTransactions) {
      processedData.categorizedTransactions = {};
    }
    
    // Initialize all categories if they don't exist
    allCategories.forEach(category => {
      if (!processedData.categorizedTransactions[category]) {
        processedData.categorizedTransactions[category] = [];
      }
    });
    
    // Add unique IDs and validate amounts for each transaction
    Object.keys(processedData.categorizedTransactions).forEach(category => {
      processedData.categorizedTransactions[category] = 
        processedData.categorizedTransactions[category].map(transaction => {
          // Add unique ID if not present
          const transactionWithId = { 
            ...transaction,
            id: transaction.id || uuidv4()
          };
          
          // Validate and correct amount based on category
          if (category === 'income' && transactionWithId.amount < 0) {
            // Income should be positive
            transactionWithId.amount = Math.abs(transactionWithId.amount);
          } else if (category !== 'income' && transactionWithId.amount > 0) {
            // Expenses should be negative
            transactionWithId.amount = -Math.abs(transactionWithId.amount);
          }
          
          return transactionWithId;
        });
    });
    
    // Calculate initial summary based on processed data
    return recalculateSummary(processedData.categorizedTransactions, processedData);
  }, [allCategories]);

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
    
    // Reset history when submitting new files
    setHistory([]);
    setHistoryIndex(-1);

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

      // Process the API response to add IDs and validate amounts
      const processedData = processApiResponse(response.data);
      setSummary(processedData);
      
      // Set initial active category if transactions exist
      if (!activeCategory && processedData.categorizedTransactions) {
        const firstNonEmptyCategory = Object.keys(processedData.categorizedTransactions)
          .find(category => processedData.categorizedTransactions[category].length > 0);
        
        if (firstNonEmptyCategory) {
          setActiveCategory(firstNonEmptyCategory);
        } else {
          setActiveCategory('income'); // Default to income if all are empty
        }
      }
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
      currency: summary?.currency || 'USD'
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
  
  // Enhanced function to recalculate all summary data after any transaction change
  const recalculateSummary = (updatedTransactions, currentSummary = summary) => {
    if (!currentSummary) return null;
    
    // Deep clone the current summary to avoid mutation
    const updatedSummary = JSON.parse(JSON.stringify(currentSummary));
    updatedSummary.categorizedTransactions = updatedTransactions;
    
    // Calculate total income and expenses
    let totalIncome = 0;
    let totalExpenses = 0;
    let transactionCount = 0;
    
    // Count all transactions and their amounts
    Object.keys(updatedTransactions).forEach(category => {
      updatedTransactions[category].forEach(transaction => {
        transactionCount++;
        if (transaction.amount >= 0) {
          totalIncome += parseFloat(transaction.amount);
        } else {
          totalExpenses += Math.abs(parseFloat(transaction.amount));
        }
      });
    });
    
    // Calculate net cashflow and average
    const netCashflow = totalIncome - totalExpenses;
    const averageTransaction = transactionCount > 0 ? 
      (totalIncome + totalExpenses) / transactionCount : 0;
    
    // Calculate top expense categories
    const categoryTotals = {};
    Object.keys(updatedTransactions).forEach(category => {
      if (category !== 'income') {
        const categoryTotal = updatedTransactions[category].reduce(
          (sum, t) => sum + (t.amount < 0 ? Math.abs(parseFloat(t.amount)) : 0), 0
        );
        if (categoryTotal > 0) {
          categoryTotals[category] = categoryTotal;
        }
      }
    });
    
    // Create sorted array of top expense categories
    const topExpenseCategories = Object.keys(categoryTotals)
      .map(category => ({
        category,
        amount: categoryTotals[category],
        percentOfTotal: totalExpenses > 0 ? 
          (categoryTotals[category] / totalExpenses) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5); // Top 5 categories
    
    // Identify potential savings in subscriptions and other categories
    const subscriptionTotal = updatedTransactions.subscriptions.reduce(
      (sum, t) => sum + Math.abs(t.amount < 0 ? parseFloat(t.amount) : 0), 0
    );
    const diningTotal = updatedTransactions.dining.reduce(
      (sum, t) => sum + Math.abs(t.amount < 0 ? parseFloat(t.amount) : 0), 0
    );
    
    // Generate savings suggestions
    const savingsOpportunities = [];
    
    if (subscriptionTotal > 0 && subscriptionTotal > totalExpenses * 0.1) {
      savingsOpportunities.push({
        category: "subscriptions",
        potentialSavings: subscriptionTotal * 0.3, // Suggest 30% reduction
        suggestion: "Consider reviewing your subscriptions. You could save by canceling unused services."
      });
    }
    
    if (diningTotal > 0 && diningTotal > totalExpenses * 0.15) {
      savingsOpportunities.push({
        category: "dining",
        potentialSavings: diningTotal * 0.2, // Suggest 20% reduction
        suggestion: "Dining expenses are significant. Consider cooking at home more often to reduce costs."
      });
    }
    
    // Find unusual transactions (large one-time expenses)
    const avgExpense = totalExpenses / Math.max(1, transactionCount);
    const unusualTransactions = [];
    
    Object.keys(updatedTransactions).forEach(category => {
      updatedTransactions[category].forEach(transaction => {
        if (transaction.amount < 0 && Math.abs(parseFloat(transaction.amount)) > avgExpense * 3) {
          unusualTransactions.push({
            id: transaction.id, // Include ID for better tracking
            description: transaction.description,
            amount: transaction.amount,
            date: transaction.date,
            reason: "Amount significantly higher than average transaction",
            category: category // Track the source category
          });
        }
      });
    });
    
    // Update all summary fields
    updatedSummary.totalIncome = totalIncome;
    updatedSummary.totalExpenses = totalExpenses; 
    updatedSummary.transactionCount = transactionCount;
    updatedSummary.unusualTransactions = unusualTransactions;
    
    // Update nested summary structure if it exists
    if (updatedSummary.summary) {
      updatedSummary.summary.totalIncome = totalIncome;
      updatedSummary.summary.totalExpenses = totalExpenses;
      updatedSummary.summary.netCashflow = netCashflow;
      updatedSummary.summary.transactionCount = transactionCount;
      updatedSummary.summary.averageTransaction = averageTransaction;
    }
    
    // Update insights if they exist
    if (updatedSummary.insights) {
      updatedSummary.insights.topExpenseCategories = topExpenseCategories;
      updatedSummary.insights.unusualTransactions = unusualTransactions;
      updatedSummary.insights.savingsOpportunities = savingsOpportunities;
    } else {
      // Create insights if they don't exist
      updatedSummary.insights = {
        topExpenseCategories,
        unusualTransactions,
        savingsOpportunities
      };
    }
    
    return updatedSummary;
  };
  
  // NEW: Change transaction category function
  const handleChangeCategory = (transactionId, newCategory, currentCategory) => {
    if (newCategory === currentCategory) return;
    
    const updatedTransactions = { ...summary.categorizedTransactions };
    
    // Find the transaction in the current category
    const currentCategoryTransactions = [...updatedTransactions[currentCategory]];
    const transactionIndex = currentCategoryTransactions.findIndex(t => t.id === transactionId);
    
    if (transactionIndex === -1) {
      console.error(`Transaction with ID ${transactionId} not found in category ${currentCategory}`);
      return;
    }
    
    // Get the transaction and remove it from the current category
    const transaction = { ...currentCategoryTransactions[transactionIndex] };
    currentCategoryTransactions.splice(transactionIndex, 1);
    updatedTransactions[currentCategory] = currentCategoryTransactions;
    
    // Adjust the amount based on new category
    if (newCategory === 'income' && transaction.amount < 0) {
      transaction.amount = Math.abs(parseFloat(transaction.amount));
    } else if (newCategory !== 'income' && transaction.amount > 0) {
      transaction.amount = -Math.abs(parseFloat(transaction.amount));
    }
    
    // Add to the new category
    updatedTransactions[newCategory] = [...updatedTransactions[newCategory], transaction];
    
    // Recalculate summary and update state
    const updatedSummary = recalculateSummary(updatedTransactions);
    setSummary(updatedSummary);
    
    // If we're on the category that the transaction was removed from, and it's now empty,
    // switch to the new category
    if (activeCategory === currentCategory && updatedTransactions[currentCategory].length === 0) {
      setActiveCategory(newCategory);
    }
  };
  
  // Handle dragging and dropping transactions between categories
  const handleDragEnd = (result) => {
    const { source, destination } = result;
    
    // Dropped outside the list
    if (!destination) return;
    
    // Get updated categorized transactions
    const updatedTransactions = { ...summary.categorizedTransactions };
    
    // Ensure all categories exist even if empty
    allCategories.forEach(category => {
      if (!updatedTransactions[category]) {
        updatedTransactions[category] = [];
      }
    });
    
    // Moving within the same category
    if (source.droppableId === destination.droppableId) {
      const items = Array.from(updatedTransactions[source.droppableId]);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);
      
      updatedTransactions[source.droppableId] = items;
    } 
    // Moving to another category
    else {
      const sourceItems = Array.from(updatedTransactions[source.droppableId]);
      const destinationItems = Array.from(updatedTransactions[destination.droppableId]);
      
      // Remove from source
      const [movedItem] = sourceItems.splice(source.index, 1);
      
      // Create a copy of the moved item to avoid mutation
      const movedItemCopy = { ...movedItem };
      
      // Validate and adjust the amount based on destination category
      if (destination.droppableId === 'income' && movedItemCopy.amount < 0) {
        // If moving to income, ensure amount is positive
        movedItemCopy.amount = Math.abs(parseFloat(movedItemCopy.amount));
      } else if (destination.droppableId !== 'income' && movedItemCopy.amount > 0) {
        // If moving to an expense category, ensure amount is negative
        movedItemCopy.amount = -Math.abs(parseFloat(movedItemCopy.amount));
      }
      
      // Add to destination
      destinationItems.splice(destination.index, 0, movedItemCopy);
      
      // Update both source and destination categories
      updatedTransactions[source.droppableId] = sourceItems;
      updatedTransactions[destination.droppableId] = destinationItems;
    }
    
    // Recalculate summary and update state
    const updatedSummary = recalculateSummary(updatedTransactions);
    setSummary(updatedSummary);
  };
  
  // Handle editing a transaction
  const handleEditTransaction = (transaction, category, index) => {
    setEditingTransaction({ category, index });
    setEditingValues({ ...transaction });
  };
  
  // Handle editing an unusual transaction
  const handleEditUnusualTransaction = (transaction, index) => {
    setEditingUnusualTransaction(index);
    setEditingValues({ ...transaction });
  };
  
  // Save changes to a transaction
  const handleSaveEdit = () => {
    if (!editingTransaction) return;
    
    const { category, index } = editingTransaction;
    const updatedTransactions = { ...summary.categorizedTransactions };
    
    // Check if category has changed
    const newCategory = editingValues.category || category;
    
    // If category changed, handle the move
    if (newCategory !== category) {
      // Get the transaction ID
      const transactionId = updatedTransactions[category][index].id;
      
      // Use the category change handler
      handleChangeCategory(transactionId, newCategory, category);
      
      // Reset editing state
      setEditingTransaction(null);
      setEditingValues({});
      return;
    }
    
    // Validate and correct amount based on category
    if (category === 'income' && editingValues.amount < 0) {
      editingValues.amount = Math.abs(parseFloat(editingValues.amount));
    } else if (category !== 'income' && editingValues.amount > 0) {
      editingValues.amount = -Math.abs(parseFloat(editingValues.amount));
    }
    
    // Update the specific transaction
    updatedTransactions[category] = [...updatedTransactions[category]];
    updatedTransactions[category][index] = {
      ...editingValues,
      amount: parseFloat(editingValues.amount) // Ensure amount is a number
    };
    
    // Recalculate summary with updated transactions
    const updatedSummary = recalculateSummary(updatedTransactions);
    setSummary(updatedSummary);
    
    // Reset editing state
    setEditingTransaction(null);
    setEditingValues({});
  };
  
  // Save changes to an unusual transaction
  const handleSaveUnusualEdit = () => {
    if (editingUnusualTransaction === null) return;
    
    // Get the current unusual transaction that's being edited
    const unusualTransactions = 
      summary.insights?.unusualTransactions || summary.unusualTransactions || [];
    const editedTransaction = unusualTransactions[editingUnusualTransaction];
    
    if (!editedTransaction || !editedTransaction.id) {
      console.error("Cannot find transaction ID for unusual transaction");
      setEditingUnusualTransaction(null);
      setEditingValues({});
      return;
    }
    
    // Find the transaction in the categorized transactions
    const updatedTransactions = { ...summary.categorizedTransactions };
    let found = false;
    let foundCategory = null;
    let foundIndex = -1;
    
    // Search for the transaction by its unique ID
    Object.keys(updatedTransactions).forEach(category => {
      if (!found) {
        const index = updatedTransactions[category].findIndex(t => t.id === editedTransaction.id);
        if (index !== -1) {
          found = true;
          foundCategory = category;
          foundIndex = index;
        }
      }
    });
    
    // Check if the category has changed
    const newCategory = editingValues.category || foundCategory;
    
    if (found) {
      // If category changed, handle the move
      if (newCategory !== foundCategory) {
        handleChangeCategory(editedTransaction.id, newCategory, foundCategory);
      } else {
        // Validate amount based on category
        if (foundCategory === 'income' && editingValues.amount < 0) {
          editingValues.amount = Math.abs(parseFloat(editingValues.amount));
        } else if (foundCategory !== 'income' && editingValues.amount > 0) {
          editingValues.amount = -Math.abs(parseFloat(editingValues.amount));
        }
        
        // Update the transaction in its category
        updatedTransactions[foundCategory] = [...updatedTransactions[foundCategory]];
        updatedTransactions[foundCategory][foundIndex] = {
          ...updatedTransactions[foundCategory][foundIndex],
          description: editingValues.description,
          amount: parseFloat(editingValues.amount),
          date: editingValues.date
        };
        
        // Recalculate everything
        const updatedSummary = recalculateSummary(updatedTransactions);
        setSummary(updatedSummary);
      }
    } else {
      console.error("Could not find the original transaction for the unusual transaction");
    }
    
    // Reset editing state
    setEditingUnusualTransaction(null);
    setEditingValues({});
  };
  
  // Cancel editing
  const handleCancelEdit = () => {
    setEditingTransaction(null);
    setEditingUnusualTransaction(null);
    setEditingValues({});
  };
  
  // Handle changes to form fields when editing
  const handleEditingChange = (e) => {
    const { name, value } = e.target;
    
    // For amount field, convert to number
    if (name === 'amount') {
      setEditingValues({
        ...editingValues,
        [name]: parseFloat(value) || 0
      });
    } else {
      setEditingValues({
        ...editingValues,
        [name]: value
      });
    }
  };
  
  // Undo the last action
  const handleUndo = () => {
    if (historyIndex > 0) {
      setIsUndoRedoAction(true);
      const previousState = history[historyIndex - 1];
      setSummary(JSON.parse(JSON.stringify(previousState)));
      setHistoryIndex(historyIndex - 1);
    }
  };
  
  // Redo the last undone action
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setIsUndoRedoAction(true);
      const nextState = history[historyIndex + 1];
      setSummary(JSON.parse(JSON.stringify(nextState)));
      setHistoryIndex(historyIndex + 1);
    }
  };

  // Helper function to get all transactions in a flat array
  const getAllTransactions = () => {
    if (!summary || !summary.categorizedTransactions) return [];
    
    const allTransactions = [];
    
    Object.keys(summary.categorizedTransactions).forEach(category => {
      summary.categorizedTransactions[category].forEach(transaction => {
        allTransactions.push({
          ...transaction,
          category: category
        });
      });
    });
    
    return allTransactions;
  };

  // Updated export functions to include ALL transactions
  const exportToCSV = () => {
    if (!summary) return;
    
    // Get all transactions in a flat array
    const allTransactions = getAllTransactions();
    
    // Header row
    let csvContent = 'ID,Category,Date,Description,Amount,Frequency\n';
    
    // Add all transactions
    allTransactions.forEach(transaction => {
      csvContent += `"${transaction.id || ''}","${transaction.category || ''}","${transaction.date || ''}","${transaction.description || ''}",${transaction.amount || 0},"${transaction.frequency || ''}"\n`;
    });
    
    // Add narrative/commentary if it exists
    if (summary.analysisText || summary.commentary || summary.narrative) {
      csvContent += '\n"Insights Commentary"\n';
      csvContent += `"${(summary.analysisText || summary.commentary || summary.narrative || '').replace(/"/g, '""')}"\n`;
    }
    
    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'bank_statement_analysis.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const exportToExcel = () => {
    if (!summary) return;
    
    try {
      setIsLoading(true);
      
      // Dynamically import xlsx to avoid build issues
      import('xlsx').then(XLSX => {
        // Create workbook
        const wb = XLSX.utils.book_new();
        
        // Add summary sheet
        const summaryData = [
          ['Bank Statement Analysis', ''],
          ['Currency', summary.currency || 'USD'],
          ['Statement Period', `${formatDate(summary.statementPeriod?.startDate)} - ${formatDate(summary.statementPeriod?.endDate)}`],
          ['Total Income', summary.summary?.totalIncome || summary.totalIncome],
          ['Total Expenses', summary.summary?.totalExpenses || summary.totalExpenses],
          ['Net Cash Flow', summary.summary?.netCashflow || 
                            (summary.summary?.totalIncome - summary.summary?.totalExpenses) || 
                            (summary.totalIncome - summary.totalExpenses)],
          ['Transaction Count', summary.summary?.transactionCount || summary.transactionCount]
        ];
        
        // Add narrative/commentary if it exists
        const narrativeText = summary.analysisText || summary.commentary || summary.narrative;
        if (narrativeText) {
          summaryData.push(['', '']);
          summaryData.push(['Insights Commentary', '']);
          
          // Split the narrative into multiple rows if it's long
          const maxCharsPerLine = 80;
          let remainingText = narrativeText;
          while (remainingText.length > 0) {
            const textSegment = remainingText.substring(0, maxCharsPerLine);
            summaryData.push([textSegment, '']);
            remainingText = remainingText.substring(maxCharsPerLine);
          }
        }
        
        const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
        
        // Add ALL transactions sheet
        const allTransactions = getAllTransactions();
        
        if (allTransactions.length > 0) {
          // Create header row
          const allTransactionsData = [
            ['ID', 'Category', 'Date', 'Description', 'Amount', 'Frequency']
          ];
          
          // Add transaction rows
          allTransactions.forEach(t => {
            allTransactionsData.push([
              t.id || '',
              t.category || '',
              formatDate(t.date),
              t.description || '',
              t.amount || 0,
              t.frequency || ''
            ]);
          });
          
          const wsAll = XLSX.utils.aoa_to_sheet(allTransactionsData);
          XLSX.utils.book_append_sheet(wb, wsAll, 'All Transactions');
        }
        
        // Add individual category sheets for better organization
        if (summary.categorizedTransactions) {
          Object.keys(summary.categorizedTransactions).forEach(category => {
            if (summary.categorizedTransactions[category].length > 0) {
              // Create header row
              const transactionData = [
                ['ID', 'Date', 'Description', 'Amount', category === 'subscriptions' ? 'Frequency' : '']
              ];
              
              // Add transaction rows
              summary.categorizedTransactions[category].forEach(t => {
                transactionData.push([
                  t.id || '',
                  formatDate(t.date),
                  t.description || '',
                  t.amount || 0,
                  t.frequency || ''
                ]);
              });
              
              const ws = XLSX.utils.aoa_to_sheet(transactionData);
              XLSX.utils.book_append_sheet(wb, ws, category.charAt(0).toUpperCase() + category.slice(1));
            }
          });
        }
        
        // Add unusual transactions if available
        const unusualTransactions = summary.insights?.unusualTransactions || summary.unusualTransactions;
        if (unusualTransactions?.length > 0) {
          const unusualData = [
            ['ID', 'Date', 'Description', 'Amount', 'Reason', 'Category']
          ];
          
          unusualTransactions.forEach(t => {
            unusualData.push([
              t.id || '',
              formatDate(t.date),
              t.description || '',
              t.amount || 0,
              t.reason || '',
              t.category || ''
            ]);
          });
          
          const ws = XLSX.utils.aoa_to_sheet(unusualData);
          XLSX.utils.book_append_sheet(wb, ws, 'Unusual Transactions');
        }
        
        // Add savings opportunities if available
        const savingsOpportunities = summary.insights?.savingsOpportunities;
        if (savingsOpportunities?.length > 0) {
          const savingsData = [
            ['Category', 'Potential Savings', 'Suggestion']
          ];
          
          savingsOpportunities.forEach(s => {
            savingsData.push([
              s.category || '',
              s.potentialSavings || 0,
              s.suggestion || ''
            ]);
          });
          
          const ws = XLSX.utils.aoa_to_sheet(savingsData);
          XLSX.utils.book_append_sheet(wb, ws, 'Savings Opportunities');
        }
        
        // Save the file
        XLSX.writeFile(wb, 'bank_statement_analysis.xlsx');
        setIsLoading(false);
      }).catch(err => {
        console.error('Error exporting to Excel:', err);
        setError('Failed to export as Excel. Please try again.');
        setIsLoading(false);
      });
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      setError('Failed to export as Excel. Please try again.');
      setIsLoading(false);
    }
  };
  
  const exportToPDF = async () => {
    if (!reportRef.current || !summary) return;
    
    try {
      setIsLoading(true);
      
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 1,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // Page width and height for A4
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save('bank_statement_analysis.pdf');
    } catch (err) {
      console.error('Error exporting to PDF:', err);
      setError('Failed to export as PDF. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Extract narrative text from various possible field names
  const getNarrativeText = () => {
    return summary?.analysisText || summary?.commentary || summary?.narrative || '';
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
        <div ref={reportRef} className="summary-container">
          <div className="summary-header">
            <h2 className="summary-title">Statement Summary</h2>
            <div className="actions-container">
              <div className="history-buttons">
                <button 
                  type="button" 
                  className="history-button undo"
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  title="Undo last change"
                >
                  ↩️ Undo
                </button>
                <button 
                  type="button" 
                  className="history-button redo"
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                  title="Redo last undone change"
                >
                  ↪️ Redo
                </button>
              </div>
              <div className="export-buttons">
                <button 
                  type="button" 
                  className="export-button csv"
                  onClick={exportToCSV}
                  disabled={isLoading}
                >
                  Export as CSV
                </button>
                <button 
                  type="button" 
                  className="export-button excel"
                  onClick={exportToExcel}
                  disabled={isLoading}
                >
                  Export as Excel
                </button>
                <button 
                  type="button" 
                  className="export-button pdf"
                  onClick={exportToPDF}
                  disabled={isLoading}
                >
                  {isLoading ? 'Generating PDF...' : 'Export as PDF'}
                </button>
              </div>
            </div>
          </div>
          
          {summary.currency && (
            <div className="currency-indicator">
              <h3 className="currency-title">Statement Currency: <strong>{summary.currency}</strong></h3>
              <p className="currency-note">All financial amounts shown in {summary.currency}</p>
            </div>
          )}
          
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
          
          {/* AI Narrative/Commentary Section */}
          {getNarrativeText() && (
            <div className="narrative-section">
              <h3 className="section-title">Insights Commentary</h3>
              <div className="narrative-content">
                <p>{getNarrativeText()}</p>
              </div>
            </div>
          )}

          {/* Categorized Transactions Section with Category Dropdown */}
          {summary.categorizedTransactions && (
            <div className="transactions-section">
              <h3 className="section-title">Transaction Categories</h3>
              <p className="recategorize-help">
                <i>Tip: Use the category dropdown to recategorize transactions. All changes are automatically saved.</i>
              </p>
              
              {/* Keep DragDropContext for backward compatibility but focus on the dropdown method */}
              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="category-tabs">
                  {/* Show all categories, even if empty */}
                  {allCategories.map(category => (
                    <button 
                      key={category}
                      className={`category-tab ${activeCategory === category ? 'active' : ''} ${summary.categorizedTransactions[category]?.length ? 'has-items' : 'empty'}`}
                      onClick={() => toggleCategory(category)}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                      <span className="category-count">{summary.categorizedTransactions[category]?.length || 0}</span>
                    </button>
                  ))}
                </div>
                
                {/* Active category display */}
                {activeCategory && (
                  <div className="category-transactions">
                    <div className="table-container">
                      <Droppable droppableId={activeCategory}>
                        {(provided) => (
                          <table 
                            className="transactions-table"
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                          >
                            <thead>
                              <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Amount</th>
                                {activeCategory === 'subscriptions' && <th>Frequency</th>}
                                <th>Category</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {summary.categorizedTransactions[activeCategory]?.map((transaction, index) => (
                                <Draggable
                                  key={transaction.id || `${transaction.description}-${index}`}
                                  draggableId={transaction.id || `${transaction.description}-${index}`}
                                  index={index}
                                >
                                  {(provided) => (
                                    <tr
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={editingTransaction && editingTransaction.category === activeCategory && editingTransaction.index === index ? 'editing' : ''}
                                    >
                                      {editingTransaction && editingTransaction.category === activeCategory && editingTransaction.index === index ? (
                                        // Editing mode
                                        <>
                                          <td>
                                            <input
                                              type="date"
                                              name="date"
                                              value={editingValues.date || ''}
                                              onChange={handleEditingChange}
                                              className="edit-input"
                                            />
                                          </td>
                                          <td>
                                            <input
                                              type="text"
                                              name="description"
                                              value={editingValues.description || ''}
                                              onChange={handleEditingChange}
                                              className="edit-input"
                                            />
                                          </td>
                                          <td>
                                            <input
                                              type="number"
                                              name="amount"
                                              value={editingValues.amount || 0}
                                              onChange={handleEditingChange}
                                              className="edit-input"
                                              step="0.01"
                                            />
                                          </td>
                                          {activeCategory === 'subscriptions' && (
                                            <td>
                                              <input
                                                type="text"
                                                name="frequency"
                                                value={editingValues.frequency || ''}
                                                onChange={handleEditingChange}
                                                className="edit-input"
                                              />
                                            </td>
                                          )}
                                          <td>
                                            <select
                                              name="category"
                                              value={editingValues.category || activeCategory}
                                              onChange={handleEditingChange}
                                              className="edit-input category-select"
                                            >
                                              {allCategories.map(cat => (
                                                <option key={cat} value={cat}>
                                                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                                </option>
                                              ))}
                                            </select>
                                          </td>
                                          <td className="action-buttons">
                                            <button 
                                              type="button" 
                                              className="action-button save"
                                              onClick={handleSaveEdit}
                                            >
                                              Save
                                            </button>
                                            <button 
                                              type="button" 
                                              className="action-button cancel"
                                              onClick={handleCancelEdit}
                                            >
                                              Cancel
                                            </button>
                                          </td>
                                        </>
                                      ) : (
                                        // Display mode
                                        <>
                                          <td>{formatDate(transaction.date)}</td>
                                          <td>{transaction.description}</td>
                                          <td className={`transaction-amount ${transaction.amount < 0 ? 'expense' : 'income'}`}>
                                            {formatCurrency(transaction.amount)}
                                          </td>
                                          {activeCategory === 'subscriptions' && <td>{transaction.frequency}</td>}
                                          <td>
                                            <select
                                              value={activeCategory}
                                              onChange={(e) => handleChangeCategory(transaction.id, e.target.value, activeCategory)}
                                              className="category-select"
                                            >
                                              {allCategories.map(cat => (
                                                <option key={cat} value={cat}>
                                                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                                </option>
                                              ))}
                                            </select>
                                          </td>
                                          <td className="action-buttons">
                                            <button 
                                              type="button" 
                                              className="action-button edit"
                                              onClick={() => handleEditTransaction(transaction, activeCategory, index)}
                                            >
                                              Edit
                                            </button>
                                          </td>
                                        </>
                                      )}
                                    </tr>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                              {(!summary.categorizedTransactions[activeCategory] || 
                               summary.categorizedTransactions[activeCategory].length === 0) && (
                                <tr className="empty-category">
                                  <td colSpan={activeCategory === 'subscriptions' ? 6 : 5} className="empty-message">
                                    No transactions in this category. Use the category dropdown on other transactions to move them here.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        )}
                      </Droppable>
                    </div>
                    
                    <div className="categories-help">
                      <h4>Recategorization Guide</h4>
                      <p>To change a transaction's category:</p>
                      <ol>
                        <li>Find the transaction you want to recategorize</li>
                        <li>Use the dropdown in the "Category" column to select a new category</li>
                        <li>The transaction will move automatically and all totals will be recalculated</li>
                      </ol>
                      <p>You can also still use drag and drop between categories.</p>
                    </div>
                  </div>
                )}
              </DragDropContext>
            </div>
          )}

          {/* All Transactions View */}
          <div className="all-transactions-section">
            <h3 className="section-title">All Transactions</h3>
            <div className="table-container">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Category</th>
                    <th>Frequency</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getAllTransactions().map((transaction, index) => (
                    <tr key={transaction.id || index}>
                      <td>{formatDate(transaction.date)}</td>
                      <td>{transaction.description}</td>
                      <td className={`transaction-amount ${transaction.amount < 0 ? 'expense' : 'income'}`}>
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td>
                        <select
                          value={transaction.category}
                          onChange={(e) => handleChangeCategory(transaction.id, e.target.value, transaction.category)}
                          className="category-select"
                        >
                          {allCategories.map(cat => (
                            <option key={cat} value={cat}>
                              {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>{transaction.frequency || '-'}</td>
                      <td className="action-buttons">
                        <button 
                          type="button" 
                          className="action-button edit"
                          onClick={() => {
                            setEditingTransaction({ 
                              category: transaction.category, 
                              index: summary.categorizedTransactions[transaction.category].findIndex(t => t.id === transaction.id) 
                            });
                            setEditingValues({ ...transaction });
                          }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                  {getAllTransactions().length === 0 && (
                    <tr>
                      <td colSpan={6} className="empty-message">
                        No transactions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

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

          {/* Savings Opportunities Section */}
          {summary.insights?.savingsOpportunities?.length > 0 && (
            <div className="savings-section">
              <h3 className="section-title">Savings Opportunities</h3>
              <div className="savings-opportunities">
                {summary.insights.savingsOpportunities.map((saving, index) => (
                  <div key={index} className="saving-opportunity">
                    <div className="saving-header">
                      <span className="saving-category">{saving.category.charAt(0).toUpperCase() + saving.category.slice(1)}</span>
                      <span className="saving-amount">{formatCurrency(saving.potentialSavings)}</span>
                    </div>
                    <p className="saving-suggestion">{saving.suggestion}</p>
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
                      <th>Reason</th>
                      <th>Category</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(summary.insights?.unusualTransactions || summary.unusualTransactions || []).map((transaction, index) => (
                      <tr key={transaction.id || index} className={editingUnusualTransaction === index ? 'editing' : ''}>
                        {editingUnusualTransaction === index ? (
                          <>
                            <td>
                              <input
                                type="date"
                                name="date"
                                value={editingValues.date || ''}
                                onChange={handleEditingChange}
                                className="edit-input"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                name="description"
                                value={editingValues.description || ''}
                                onChange={handleEditingChange}
                                className="edit-input"
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                name="amount"
                                value={editingValues.amount || 0}
                                onChange={handleEditingChange}
                                className="edit-input"
                                step="0.01"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                name="reason"
                                value={editingValues.reason || ''}
                                onChange={handleEditingChange}
                                className="edit-input"
                              />
                            </td>
                            <td>
                              <select
                                name="category"
                                value={editingValues.category || transaction.category || 'other'}
                                onChange={handleEditingChange}
                                className="edit-input category-select"
                              >
                                {allCategories.map(cat => (
                                  <option key={cat} value={cat}>
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="action-buttons">
                              <button 
                                type="button" 
                                className="action-button save"
                                onClick={handleSaveUnusualEdit}
                              >
                                Save
                              </button>
                              <button 
                                type="button" 
                                className="action-button cancel"
                                onClick={handleCancelEdit}
                              >
                                Cancel
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td>{formatDate(transaction.date)}</td>
                            <td>{transaction.description}</td>
                            <td className={`transaction-amount ${transaction.amount < 0 ? 'expense' : 'income'}`}>
                              {formatCurrency(transaction.amount)}
                            </td>
                            <td>{transaction.reason}</td>
                            <td>
                              <select
                                value={transaction.category || 'other'}
                                onChange={(e) => {
                                  const originalCategory = transaction.category || 'other';
                                  // Find the transaction in its original category
                                  const transactionId = transaction.id;
                                  if (transactionId) {
                                    handleChangeCategory(transactionId, e.target.value, originalCategory);
                                  }
                                }}
                                className="category-select"
                              >
                                {allCategories.map(cat => (
                                  <option key={cat} value={cat}>
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="action-buttons">
                              <button 
                                type="button" 
                                className="action-button edit"
                                onClick={() => handleEditUnusualTransaction(transaction, index)}
                              >
                                Edit
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BankStatementUploader;