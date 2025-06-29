// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';

// const FinancialPlanner = () => {
//   // Form state
//   const [currentStep, setCurrentStep] = useState(1);
//   const [formData, setFormData] = useState({
//     income: [],
//     fixedExpenses: [],
//     variableExpenses: [],
//     liabilities: [],
//     assets: []
//   });

//   // Goals state
//   const [goals, setGoals] = useState({
//     emergencyFund: {
//       targetMonths: 3,
//       monthlyContribution: 0,
//       calculated: false
//     },
//     trip: {
//       budget: 0,
//       timeframe: 12,
//       monthlyContribution: 0,
//       calculated: false
//     },
//     luxuryItem: {
//       budget: 0,
//       timeframe: 12,
//       monthlyContribution: 0,
//       calculated: false
//     },
//     downPayment: {
//       budget: 0,
//       timeframe: 60,
//       monthlyContribution: 0,
//       calculated: false
//     }
//   });

//   // UI state
//   const [showInsights, setShowInsights] = useState(false);
//   const [activeModal, setActiveModal] = useState(null);
//   const [debtStrategy, setDebtStrategy] = useState('snowball');

//   // Calculated values
//   const [disposableIncome, setDisposableIncome] = useState(0);
//   const [netWorth, setNetWorth] = useState(0);

//   // Calculate totals whenever form data changes
//   useEffect(() => {
//     calculateTotals();
//   }, [formData]);

//   const calculateTotals = () => {
//     // Calculate total monthly income
//     const totalIncome = formData.income.reduce((sum, item) => sum + (item.amount || 0), 0);
    
//     // Calculate total monthly expenses
//     const totalFixed = formData.fixedExpenses.reduce((sum, item) => sum + (item.amount || 0), 0);
//     const totalVariable = formData.variableExpenses.reduce((sum, item) => sum + (item.amount || 0), 0);
    
//     // Calculate total monthly debt payments
//     const totalDebtPayments = formData.liabilities.reduce((sum, item) => sum + (item.minPayment || 0), 0);
    
//     // Calculate disposable income
//     setDisposableIncome(totalIncome - totalFixed - totalVariable - totalDebtPayments);
    
//     // Calculate net worth
//     const totalAssets = formData.assets.reduce((sum, item) => sum + (item.value || 0), 0);
//     const totalLiabilities = formData.liabilities.reduce((sum, item) => sum + (item.balance || 0), 0);
//     setNetWorth(totalAssets - totalLiabilities);
//   };

//   const handleInputChange = (section, index, field, value) => {
//     const updatedSection = [...formData[section]];
//     updatedSection[index][field] = value;
//     setFormData({
//       ...formData,
//       [section]: updatedSection
//     });
//   };

//   const addNewItem = (section) => {
//     const defaultItem = {
//       name: '',
//       amount: 0,
//       ...(section === 'liabilities' && { balance: 0, interestRate: 0, minPayment: 0 }),
//       ...(section === 'assets' && { value: 0, type: 'asset' })
//     };
    
//     setFormData({
//       ...formData,
//       [section]: [...formData[section], defaultItem]
//     });
//   };

//   const removeItem = (section, index) => {
//     const updatedSection = [...formData[section]];
//     updatedSection.splice(index, 1);
//     setFormData({
//       ...formData,
//       [section]: updatedSection
//     });
//   };

//   const calculateGoal = (goalKey) => {
//     const goal = goals[goalKey];
//     let monthly = 0;
    
//     if (goalKey === 'emergencyFund') {
//       const essentialExpenses = formData.fixedExpenses.reduce((sum, item) => sum + (item.amount || 0), 0);
//       monthly = (essentialExpenses * goal.targetMonths) / goal.timeframe;
//     } else {
//       monthly = goal.budget / goal.timeframe;
//     }
    
//     setGoals({
//       ...goals,
//       [goalKey]: {
//         ...goal,
//         monthlyContribution: Math.round(monthly),
//         calculated: true
//       }
//     });
//   };

//   const renderSection = (section, title, fields) => {
//     return (
//       <motion.div 
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.3 }}
//         className="section-container"
//       >
//         <h3>{title}</h3>
//         {formData[section].map((item, index) => (
//           <div key={index} className="input-row">
//             <input
//               type="text"
//               placeholder="Name"
//               value={item.name}
//               onChange={(e) => handleInputChange(section, index, 'name', e.target.value)}
//             />
            
//             {fields.map(field => (
//               <input
//                 key={field}
//                 type="number"
//                 placeholder={field}
//                 min="1"
//                 value={item[field]}
//                 onChange={(e) => handleInputChange(section, index, field, parseFloat(e.target.value))}
//               />
//             ))}
            
//             {section === 'assets' && (
//               <select
//                 value={item.type}
//                 onChange={(e) => handleInputChange(section, index, 'type', e.target.value)}
//               >
//                 <option value="asset">Asset</option>
//                 <option value="liability">Liability</option>
//               </select>
//             )}
            
//             <button onClick={() => removeItem(section, index)}>Remove</button>
//           </div>
//         ))}
        
//         <button onClick={() => addNewItem(section)}>+ Add {title}</button>
//       </motion.div>
//     );
//   };

//   const renderGoal = (goalKey, label, unit = '$') => {
//     const goal = goals[goalKey];
    
//     return (
//       <div className="goal-card">
//         <h4>{label}</h4>
        
//         {goalKey === 'emergencyFund' ? (
//           <>
//             <div className="slider-container">
//               <span>Target: {goal.targetMonths} months</span>
//               <input
//                 type="range"
//                 min="1"
//                 max="12"
//                 value={goal.targetMonths}
//                 onChange={(e) => setGoals({
//                   ...goals,
//                   emergencyFund: {
//                     ...goal,
//                     targetMonths: parseInt(e.target.value)
//                   }
//                 })}
//               />
//             </div>
//           </>
//         ) : (
//           <>
//             <input
//               type="number"
//               placeholder={`Target ${unit}`}
//               value={goal.budget}
//               onChange={(e) => setGoals({
//                 ...goals,
//                 [goalKey]: {
//                   ...goal,
//                   budget: parseFloat(e.target.value)
//                 }
//               })}
//             />
            
//             <div className="slider-container">
//               <span>Timeframe: {goal.timeframe} months</span>
//               <input
//                 type="range"
//                 min="1"
//                 max={goalKey === 'downPayment' ? '120' : '60'}
//                 value={goal.timeframe}
//                 onChange={(e) => setGoals({
//                   ...goals,
//                   [goalKey]: {
//                     ...goal,
//                     timeframe: parseInt(e.target.value)
//                   }
//                 })}
//               />
//             </div>
//           </>
//         )}
        
//         {goal.calculated && (
//           <div className="goal-result">
//             Monthly contribution: {unit}{goal.monthlyContribution}
//           </div>
//         )}
        
//         <button onClick={() => calculateGoal(goalKey)}>
//           Calculate
//         </button>
//       </div>
//     );
//   };

//   const renderDebtPlan = () => {
//     const sortedDebts = [...formData.liabilities].sort((a, b) => {
//       if (debtStrategy === 'snowball') {
//         return a.balance - b.balance; // Sort by smallest balance first
//       } else {
//         return b.interestRate - a.interestRate; // Sort by highest interest first
//       }
//     });
    
//     return (
//       <div className="insight-card">
//         <h4>Debt Repayment Strategy</h4>
        
//         <div className="strategy-toggle">
//           <button
//             className={debtStrategy === 'snowball' ? 'active' : ''}
//             onClick={() => setDebtStrategy('snowball')}
//           >
//             Snowball Method
//           </button>
//           <button
//             className={debtStrategy === 'avalanche' ? 'active' : ''}
//             onClick={() => setDebtStrategy('avalanche')}
//           >
//             Avalanche Method
//           </button>
//         </div>
        
//         <div className="debt-list">
//           {sortedDebts.map((debt, index) => (
//             <div key={index} className="debt-item">
//               <span>{debt.name}</span>
//               <span>Balance: ${debt.balance}</span>
//               <span>Interest: {debt.interestRate}%</span>
//               <span>Priority: {index + 1}</span>
//             </div>
//           ))}
//         </div>
        
//         {disposableIncome > 0 && (
//           <div className="projection">
//             <p>With ${disposableIncome} monthly extra, you could pay off all debts in X months.</p>
//           </div>
//         )}
//       </div>
//     );
//   };

//   const renderSavingsRecommendations = () => {
//     const totalGoalsMonthly = Object.values(goals)
//       .filter(goal => goal.calculated)
//       .reduce((sum, goal) => sum + goal.monthlyContribution, 0);
    
//     const savingsGap = totalGoalsMonthly - disposableIncome;
    
//     return (
//       <div className="insight-card">
//         <h4>Savings Recommendations</h4>
        
//         {savingsGap > 0 ? (
//           <>
//             <p>You're ${savingsGap} short each month to meet all your goals.</p>
//             <p>Consider:</p>
//             <ul>
//               <li>Reducing variable expenses by ${Math.round(savingsGap * 0.6)}</li>
//               <li>Increasing income by ${Math.round(savingsGap * 0.4)}</li>
//               <li>Adjusting your goal timelines</li>
//             </ul>
//           </>
//         ) : (
//           <p>You're on track! You have ${-savingsGap} available each month after meeting all goals.</p>
//         )}
//       </div>
//     );
//   };

//   return (
//     <div className="financial-planner">
//       {/* Progress indicator */}
//       <div className="progress-steps">
//         {[1, 2, 3, 4, 5].map((step) => (
//           <div
//             key={step}
//             className={`step ${currentStep === step ? 'active' : ''}`}
//             onClick={() => setCurrentStep(step)}
//           >
//             {step}
//           </div>
//         ))}
//       </div>
      
//       <AnimatePresence mode="wait">
//         {currentStep === 1 && (
//           <motion.div
//             key="income"
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: 20 }}
//             transition={{ duration: 0.3 }}
//           >
//             {renderSection('income', 'Income Sources', ['amount'])}
//           </motion.div>
//         )}
        
//         {currentStep === 2 && (
//           <motion.div
//             key="expenses"
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: 20 }}
//             transition={{ duration: 0.3 }}
//           >
//             {renderSection('fixedExpenses', 'Fixed Expenses', ['amount'])}
//             {renderSection('variableExpenses', 'Variable Expenses', ['amount'])}
//           </motion.div>
//         )}
        
//         {currentStep === 3 && (
//           <motion.div
//             key="liabilities"
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: 20 }}
//             transition={{ duration: 0.3 }}
//           >
//             {renderSection('liabilities', 'Liabilities', ['balance', 'interestRate', 'minPayment'])}
//           </motion.div>
//         )}
        
//         {currentStep === 4 && (
//           <motion.div
//             key="assets"
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: 20 }}
//             transition={{ duration: 0.3 }}
//           >
//             {renderSection('assets', 'Assets', ['value'])}
//           </motion.div>
//         )}
        
//         {currentStep === 5 && (
//           <motion.div
//             key="goals"
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: 20 }}
//             transition={{ duration: 0.3 }}
//           >
//             <h2>Set Your Financial Goals</h2>
            
//             <div className="goals-grid">
//               {renderGoal('emergencyFund', 'Emergency Fund')}
//               {renderGoal('trip', 'Dream Vacation')}
//               {renderGoal('luxuryItem', 'Luxury Purchase')}
//               {renderGoal('downPayment', 'Home Down Payment')}
//             </div>
            
//             <div className="summary-section">
//               <h3>Your Financial Summary</h3>
//               <p>Disposable Income: ${disposableIncome}</p>
//               <p>Net Worth: ${netWorth}</p>
              
//               <button onClick={() => setShowInsights(!showInsights)}>
//                 {showInsights ? 'Hide Insights' : 'Show Insights'}
//               </button>
              
//               {showInsights && (
//                 <div className="insights-container">
//                   {renderDebtPlan()}
//                   {renderSavingsRecommendations()}
//                 </div>
//               )}
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
      
//       <div className="navigation-buttons">
//         {currentStep > 1 && (
//           <button onClick={() => setCurrentStep(currentStep - 1)}>
//             Previous
//           </button>
//         )}
        
//         {currentStep < 5 ? (
//           <button onClick={() => setCurrentStep(currentStep + 1)}>
//             Next
//           </button>
//         ) : (
//           <button onClick={() => alert('Financial plan complete!')}>
//             Complete Plan
//           </button>
//         )}
//       </div>
      
//       {/* Modal system */}
//       <AnimatePresence>
//         {activeModal === 'debt-simulation' && (
//           <motion.div
//             className="modal-overlay"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//           >
//             <motion.div
//               className="modal-content"
//               initial={{ scale: 0.9 }}
//               animate={{ scale: 1 }}
//               exit={{ scale: 0.9 }}
//             >
//               <h3>Debt Repayment Simulation</h3>
//               {/* Debt simulation content */}
//               <button onClick={() => setActiveModal(null)}>Close</button>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default FinancialPlanner;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChartLine, FaMoneyBillWave, FaCreditCard, FaHome, FaPlane } from 'react-icons/fa';
import '../styles/FinancialPlanner.css';

const FinancialPlanner = () => {
  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    income: [],
    fixedExpenses: [],
    variableExpenses: [],
    liabilities: [],
    assets: []
  });

  // Goals state
  const [goals, setGoals] = useState({
    emergencyFund: {
      targetMonths: 3,
      timeframe: 12,
      monthlyContribution: 0,
      calculated: false
    },
    trip: {
      budget: 0,
      timeframe: 12,
      monthlyContribution: 0,
      calculated: false
    },
    luxuryItem: {
      budget: 0,
      timeframe: 12,
      monthlyContribution: 0,
      calculated: false
    },
    downPayment: {
      budget: 0,
      timeframe: 60,
      monthlyContribution: 0,
      calculated: false
    }
  });

  // UI state
  const [showInsights, setShowInsights] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [debtStrategy, setDebtStrategy] = useState('snowball');

  // Calculated values
  const [disposableIncome, setDisposableIncome] = useState(0);
  const [netWorth, setNetWorth] = useState(0);
  const [monthlyBalance, setMonthlyBalance] = useState(0);

  // Calculate totals whenever form data changes
  useEffect(() => {
    calculateTotals();
  }, [formData]);

  const calculateTotals = () => {
    // Calculate total monthly income
    const totalIncome = formData.income.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    
    // Calculate total monthly expenses
    const totalFixed = formData.fixedExpenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const totalVariable = formData.variableExpenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    
    // Calculate total monthly debt payments
    const totalDebtPayments = formData.liabilities.reduce((sum, item) => sum + (parseFloat(item.minPayment) || 0), 0);
    
    // Calculate disposable income
    setDisposableIncome(totalIncome - totalFixed - totalVariable - totalDebtPayments);
    
    // Calculate net worth
    const totalAssets = formData.assets.reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0);
    const totalLiabilities = formData.liabilities.reduce((sum, item) => sum + (parseFloat(item.balance) || 0), 0);
    setNetWorth(totalAssets - totalLiabilities);
    
    // Calculate monthly balance (income minus expenses)
    setMonthlyBalance(totalIncome - totalFixed - totalVariable);
  };

  const handleInputChange = (section, index, field, value) => {
    const updatedSection = [...formData[section]];
    updatedSection[index][field] = value;
    setFormData({
      ...formData,
      [section]: updatedSection
    });
  };

  const addNewItem = (section) => {
    const defaultItem = {
      name: '',
      amount: '',
      ...(section === 'liabilities' && { balance: '', interestRate: '', minPayment: '' }),
      ...(section === 'assets' && { value: '', type: 'asset' })
    };
    
    setFormData({
      ...formData,
      [section]: [...formData[section], defaultItem]
    });
  };

  const removeItem = (section, index) => {
    const updatedSection = [...formData[section]];
    updatedSection.splice(index, 1);
    setFormData({
      ...formData,
      [section]: updatedSection
    });
  };

  const calculateGoal = (goalKey) => {
    const goal = goals[goalKey];
    let monthly = 0;
    
    if (goalKey === 'emergencyFund') {
      const essentialExpenses = formData.fixedExpenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
      monthly = (essentialExpenses * goal.targetMonths) / goal.timeframe;
    } else {
      monthly = goal.budget / goal.timeframe;
    }
    
    setGoals({
      ...goals,
      [goalKey]: {
        ...goal,
        monthlyContribution: Math.round(monthly),
        calculated: true
      }
    });
  };

  const getStepIcon = (step) => {
    switch(step) {
      case 1: return <FaMoneyBillWave />;
      case 2: return <FaChartLine />;
      case 3: return <FaCreditCard />;
      case 4: return <FaHome />;
      case 5: return <FaPlane />;
      default: return null;
    }
  };

  const getStepTitle = (step) => {
    switch(step) {
      case 1: return "Income Sources";
      case 2: return "Monthly Expenses";
      case 3: return "Debt & Liabilities";
      case 4: return "Assets & Savings";
      case 5: return "Financial Goals";
      default: return "";
    }
  };

  const renderSection = (section, title, fields) => {
    return (
      <div className="form-section-container">
        <h3 className="section-title">{title}</h3>
        <p className="section-description">
          {section === 'income' && "List all your sources of income including salary, investments, side hustles, etc."}
          {section === 'fixedExpenses' && "Enter your regular monthly expenses that don't change much month to month."}
          {section === 'variableExpenses' && "Enter your expenses that tend to fluctuate each month."}
          {section === 'liabilities' && "List all your debts including credit cards, loans, mortgages, etc."}
          {section === 'assets' && "List your assets including savings, investments, property, etc."}
        </p>
        
        <div className="input-entries">
          {formData[section].length === 0 ? (
            <div className="empty-state">
              <p>No {title.toLowerCase()} added yet.</p>
              <button className="add-button" onClick={() => addNewItem(section)}>+ Add Your First {title.slice(0, -1)}</button>
            </div>
          ) : (
            <>
              <div className="entry-header">
                <span>Description</span>
                {fields.map(field => (
                  <span key={field}>
                    {field === 'amount' && 'Amount ($)'}
                    {field === 'balance' && 'Balance ($)'}
                    {field === 'interestRate' && 'Rate (%)'}
                    {field === 'minPayment' && 'Payment ($)'}
                    {field === 'value' && 'Value ($)'}
                  </span>
                ))}
                <span></span>
              </div>
              
              {formData[section].map((item, index) => (
                <div key={index} className="input-entry">
                  <input
                    type="text"
                    placeholder={`${title.slice(0, -1)} name`}
                    value={item.name}
                    onChange={(e) => handleInputChange(section, index, 'name', e.target.value)}
                    className="name-input"
                  />
                  
                  {fields.map(field => (
                    <input
                      key={field}
                      type="number"
                      placeholder={field === 'interestRate' ? '0.0' : '0'}
                      min="0"
                      step={field === 'interestRate' ? "0.1" : "1"}
                      value={item[field]}
                      onChange={(e) => handleInputChange(section, index, field, e.target.value)}
                      className="number-input"
                    />
                  ))}
                  
                  <button 
                    onClick={() => removeItem(section, index)}
                    className="remove-button"
                    aria-label="Remove item"
                  >
                    ×
                  </button>
                </div>
              ))}
              
              <button className="add-button" onClick={() => addNewItem(section)}>
                + Add Another {title.slice(0, -1)}
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderGoal = (goalKey, label, icon) => {
    const goal = goals[goalKey];
    
    return (
      <div className="goal-card">
        <div className="goal-header">
          {icon}
          <h4>{label}</h4>
        </div>
        
        {goalKey === 'emergencyFund' ? (
          <>
            <div className="goal-setting">
              <label>Target Months of Expenses</label>
              <div className="slider-container">
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={goal.targetMonths}
                  onChange={(e) => setGoals({
                    ...goals,
                    emergencyFund: {
                      ...goal,
                      targetMonths: parseInt(e.target.value)
                    }
                  })}
                />
                <span className="slider-value">{goal.targetMonths}</span>
              </div>
            </div>
            
            <div className="goal-setting">
              <label>Timeframe (months)</label>
              <div className="slider-container">
                <input
                  type="range"
                  min="1"
                  max="36"
                  value={goal.timeframe}
                  onChange={(e) => setGoals({
                    ...goals,
                    emergencyFund: {
                      ...goal,
                      timeframe: parseInt(e.target.value)
                    }
                  })}
                />
                <span className="slider-value">{goal.timeframe}</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="goal-setting">
              <label>Target Amount ($)</label>
              <input
                type="number"
                placeholder="0"
                min="0"
                value={goal.budget}
                onChange={(e) => setGoals({
                  ...goals,
                  [goalKey]: {
                    ...goal,
                    budget: parseFloat(e.target.value)
                  }
                })}
              />
            </div>
            
            <div className="goal-setting">
              <label>Timeframe (months)</label>
              <div className="slider-container">
                <input
                  type="range"
                  min="1"
                  max={goalKey === 'downPayment' ? '120' : '60'}
                  value={goal.timeframe}
                  onChange={(e) => setGoals({
                    ...goals,
                    [goalKey]: {
                      ...goal,
                      timeframe: parseInt(e.target.value)
                    }
                  })}
                />
                <span className="slider-value">{goal.timeframe}</span>
              </div>
            </div>
          </>
        )}
        
        <button 
          onClick={() => calculateGoal(goalKey)}
          className="calculate-button"
          disabled={goalKey === 'emergencyFund' ? 
            formData.fixedExpenses.length === 0 : 
            !goal.budget
          }
        >
          Calculate Monthly Savings
        </button>
        
        {goal.calculated && (
          <div className="goal-result">
            <div className="result-label">Monthly contribution:</div>
            <div className="result-value">${goal.monthlyContribution}</div>
          </div>
        )}
      </div>
    );
  };

  const renderDebtPlan = () => {
    if (formData.liabilities.length === 0) {
      return (
        <div className="insight-card">
          <h4>Debt Repayment Strategy</h4>
          <p className="empty-insight">No debts added. Add your liabilities in step 3 to see your personalized repayment plan.</p>
        </div>
      );
    }
    
    const sortedDebts = [...formData.liabilities].sort((a, b) => {
      if (debtStrategy === 'snowball') {
        return parseFloat(a.balance) - parseFloat(b.balance); // Sort by smallest balance first
      } else {
        return parseFloat(b.interestRate) - parseFloat(a.interestRate); // Sort by highest interest first
      }
    });
    
    // Calculate months to repay if allocating disposable income
    let monthsToRepay = 0;
    if (disposableIncome > 0) {
      const totalDebt = formData.liabilities.reduce((sum, item) => sum + parseFloat(item.balance || 0), 0);
      const totalMinPayments = formData.liabilities.reduce((sum, item) => sum + parseFloat(item.minPayment || 0), 0);
      
      // Simple estimation - actual would need to account for interest accrual
      if (totalMinPayments + disposableIncome > 0) {
        monthsToRepay = Math.ceil(totalDebt / (totalMinPayments + disposableIncome));
      }
    }
    
    return (
      <div className="insight-card">
        <h4>Debt Repayment Strategy</h4>
        
        <div className="strategy-toggle">
          <button
            className={debtStrategy === 'snowball' ? 'active' : ''}
            onClick={() => setDebtStrategy('snowball')}
          >
            Snowball Method
          </button>
          <button
            className={debtStrategy === 'avalanche' ? 'active' : ''}
            onClick={() => setDebtStrategy('avalanche')}
          >
            Avalanche Method
          </button>
        </div>
        
        <div className="strategy-description">
          <p>
            {debtStrategy === 'snowball' 
              ? 'The Snowball Method focuses on paying off your smallest debts first to build momentum.'
              : 'The Avalanche Method focuses on paying off high-interest debts first to minimize interest payments.'}
          </p>
        </div>
        
        <div className="debt-list">
          {sortedDebts.map((debt, index) => (
            <div key={index} className="debt-item">
              <div className="debt-priority">{index + 1}</div>
              <div className="debt-details">
                <div className="debt-name">{debt.name || 'Unnamed Debt'}</div>
                <div className="debt-stats">
                  <span>Balance: ${parseFloat(debt.balance || 0).toLocaleString()}</span>
                  <span>Interest: {debt.interestRate || 0}%</span>
                  <span>Payment: ${parseFloat(debt.minPayment || 0).toLocaleString()}/mo</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {disposableIncome > 0 && (
          <div className="projection">
            <p>With ${disposableIncome.toLocaleString()} monthly extra, you could pay off all debts in approximately {monthsToRepay} months.</p>
          </div>
        )}
      </div>
    );
  };

  const renderSavingsRecommendations = () => {
    const totalGoalsMonthly = Object.values(goals)
      .filter(goal => goal.calculated)
      .reduce((sum, goal) => sum + goal.monthlyContribution, 0);
    
    const savingsGap = totalGoalsMonthly - disposableIncome;
    
    return (
      <div className="insight-card">
        <h4>Savings Recommendations</h4>
        
        {Object.values(goals).filter(goal => goal.calculated).length === 0 ? (
          <p className="empty-insight">Calculate your financial goals to see personalized savings recommendations.</p>
        ) : savingsGap > 0 ? (
          <>
            <div className="recommendation-alert">
              <p>You're <strong>${savingsGap.toLocaleString()}</strong> short each month to meet all your financial goals.</p>
            </div>
            
            <h5>Consider these options:</h5>
            <ul className="recommendations-list">
              <li>Reduce variable expenses by <strong>${Math.round(savingsGap * 0.6).toLocaleString()}</strong> per month</li>
              <li>Find ways to increase income by <strong>${Math.round(savingsGap * 0.4).toLocaleString()}</strong> per month</li>
              <li>Extend the timeline for some of your financial goals</li>
              <li>Prioritize your most important goals for now</li>
            </ul>
          </>
        ) : (
          <div className="recommendation-success">
            <p>You're on track! You have <strong>${Math.abs(savingsGap).toLocaleString()}</strong> available each month after meeting all your financial goals.</p>
            <p>Consider putting this extra money toward:</p>
            <ul className="recommendations-list">
              <li>Additional debt repayment to become debt-free sooner</li>
              <li>Increased retirement contributions</li>
              <li>Additional investments to build long-term wealth</li>
              <li>Accelerating your existing financial goals</li>
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="financial-planner">
      <div className="planner-header">
        <h1>Personal Financial Planner</h1>
        <p>Build a comprehensive financial plan tailored to your goals and situation</p>
      </div>
      
      {/* Progress indicator */}
      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${(currentStep / 5) * 100}%` }}></div>
        <div className="progress-steps">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`step ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
              onClick={() => setCurrentStep(step)}
            >
              <div className="step-icon">
                {currentStep > step ? '✓' : getStepIcon(step)}
              </div>
              <div className="step-label">{getStepTitle(step)}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="planner-content">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="income"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="form-step"
            >
              <div className="step-header">
                <h2>Step 1: Income Sources</h2>
                <p>Let's start by understanding your monthly income from all sources</p>
              </div>
              {renderSection('income', 'Income Sources', ['amount'])}
            </motion.div>
          )}
          
          {currentStep === 2 && (
            <motion.div
              key="expenses"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="form-step"
            >
              <div className="step-header">
                <h2>Step 2: Monthly Expenses</h2>
                <p>Next, let's track your monthly spending habits</p>
              </div>
              {renderSection('fixedExpenses', 'Fixed Expenses', ['amount'])}
              {renderSection('variableExpenses', 'Variable Expenses', ['amount'])}
              
              {formData.income.length > 0 && (formData.fixedExpenses.length > 0 || formData.variableExpenses.length > 0) && (
                <div className="monthly-summary">
                  <h3>Monthly Cash Flow Summary</h3>
                  <div className="summary-details">
                    <div className="summary-item">
                      <span className="item-label">Total Income:</span>
                      <span className="item-value">${formData.income.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0).toLocaleString()}</span>
                    </div>
                    <div className="summary-item">
                      <span className="item-label">Total Expenses:</span>
                      <span className="item-value">${(
                        formData.fixedExpenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0) +
                        formData.variableExpenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
                      ).toLocaleString()}</span>
                    </div>
                    <div className="summary-item balance">
                      <span className="item-label">Monthly Balance:</span>
                      <span className={`item-value ${monthlyBalance >= 0 ? 'positive' : 'negative'}`}>
                        ${monthlyBalance.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
          
          {currentStep === 3 && (
            <motion.div
              key="liabilities"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="form-step"
            >
              <div className="step-header">
                <h2>Step 3: Debt & Liabilities</h2>
                <p>Add your outstanding debts to develop a repayment strategy</p>
              </div>
              {renderSection('liabilities', 'Liabilities', ['balance', 'interestRate', 'minPayment'])}
            </motion.div>
          )}
          
          {currentStep === 4 && (
            <motion.div
              key="assets"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="form-step"
            >
              <div className="step-header">
                <h2>Step 4: Assets & Savings</h2>
                <p>List your assets to calculate your net worth</p>
              </div>
              {renderSection('assets', 'Assets', ['value'])}
              
              {(formData.assets.length > 0 || formData.liabilities.length > 0) && (
                <div className="net-worth-summary">
                  <h3>Your Net Worth Summary</h3>
                  <div className="summary-details">
                    <div className="summary-item">
                      <span className="item-label">Total Assets:</span>
                      <span className="item-value">${formData.assets.reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0).toLocaleString()}</span>
                    </div>
                    <div className="summary-item">
                      <span className="item-label">Total Liabilities:</span>
                      <span className="item-value">${formData.liabilities.reduce((sum, item) => sum + (parseFloat(item.balance) || 0), 0).toLocaleString()}</span>
                    </div>
                    <div className="summary-item net-worth">
                      <span className="item-label">Net Worth:</span>
                      <span className={`item-value ${netWorth >= 0 ? 'positive' : 'negative'}`}>
                        ${netWorth.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
          
          {currentStep === 5 && (
            <motion.div
              key="goals"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="form-step"
            >
              <div className="step-header">
                <h2>Step 5: Financial Goals</h2>
                <p>Set clear financial goals and see how to achieve them</p>
              </div>
              
              <div className="financial-summary">
                <div className="summary-card">
                  <h3>Your Financial Overview</h3>
                  <div className="summary-stats">
                    <div className="stat-item">
                      <div className="stat-label">Monthly Income</div>
                      <div className="stat-value">${formData.income.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0).toLocaleString()}</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">Monthly Expenses</div>
                      <div className="stat-value">${(
                        formData.fixedExpenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0) +
                        formData.variableExpenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
                      ).toLocaleString()}</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">Debt Payments</div>
                      <div className="stat-value">${formData.liabilities.reduce((sum, item) => sum + (parseFloat(item.minPayment) || 0), 0).toLocaleString()}</div>
                    </div>
                    <div className="stat-item highlight">
                      <div className="stat-label">Disposable Income</div>
                      <div className={`stat-value ${disposableIncome >= 0 ? 'positive' : 'negative'}`}>
                        ${disposableIncome.toLocaleString()}
                      </div>
                    </div>
                    <div className="stat-item highlight">
                      <div className="stat-label">Net Worth</div>
                      <div className={`stat-value ${netWorth >= 0 ? 'positive' : 'negative'}`}>
                        ${netWorth.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <h3 className="goals-section-title">Set Your Financial Goals</h3>
              <div className="goals-grid">
                {renderGoal('emergencyFund', 'Emergency Fund', <FaMoneyBillWave />)}
                {renderGoal('trip', 'Dream Vacation', <FaPlane />)}
                {renderGoal('luxuryItem', 'Luxury Purchase', <FaCreditCard />)}
                {renderGoal('downPayment', 'Home Down Payment', <FaHome />)}
              </div>
              
              <div className="insights-section">
                <button 
                  onClick={() => setShowInsights(!showInsights)} 
                  className="insights-toggle-button"
                >
                  {showInsights ? 'Hide Financial Insights' : 'Show Financial Insights'}
                </button>
                
                {showInsights && (
                  <motion.div 
                    className="insights-container"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderDebtPlan()}
                    {renderSavingsRecommendations()}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="navigation-buttons">
        {currentStep > 1 && (
          <button 
            onClick={() => setCurrentStep(currentStep - 1)}
            className="prev-button"
          >
            Previous
          </button>
        )}
        
        {currentStep < 5 ? (
          <button 
            onClick={() => setCurrentStep(currentStep + 1)}
            className="next-button"
          >
            Continue
          </button>
        ) : (
          <button 
            onClick={() => window.print()}
            className="print-button"
          >
            Print Financial Plan
          </button>
        )}
      </div>
      
      {/* Modal system */}
      <AnimatePresence>
        {activeModal === 'debt-simulation' && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <h3>Debt Repayment Simulation</h3>
              {/* Debt simulation content */}
              <button onClick={() => setActiveModal(null)}>Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FinancialPlanner;