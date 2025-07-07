import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import savingsJar from '../resources/savingsJar.svg';
import '../styles/SavingsSeries.css'; 

const courses = [{
  "title": "Money Master Class",
  "content":[
   {
      "title":"1. The Power of Tiny Savings: How Small Changes Add Up",
      "summary":"Amanda used to believe that saving money was impossible with her tight budget. But when she started setting aside just £5 a week, she was amazed at how quickly it added up. Over a year, this habit turned into £260. According to the Money Advice Service, 20% of UK adults have less than £100 in savings, so Amanda's small savings habit set her apart and gave her peace of mind.",
      "learning_nugget":"Even the smallest amount saved regularly can grow significantly over time and build a crucial financial safety net.",
      "fact":"Regular small savings can grow into a substantial amount over time, and 20% of UK adults have less than £100 in savings."
   },
   {
      "title":"2. Breaking the Cycle: How to Start Saving Even When You're in Debt",
      "summary":"Amanda was drowning in £8,000 of credit card debt and felt overwhelmed. She decided to allocate 5% of her income to savings while steadily paying down her debt. Research by the Financial Conduct Authority (FCA) shows that over 50% of UK adults with credit card debt only make the minimum payment each month. Amanda's approach, known as 'paying yourself first,' allowed her to build a small savings buffer while reducing her debt by £1,600 in the first year.",
      "learning_nugget":"Start saving even a small amount while managing debt to create a safety net and reduce financial stress.",
      "fact":"Over 50% of UK adults with credit card debt make only the minimum payment, increasing the overall cost of their debt."
   },
   {
      "title":"3. The 30-Day No-Spend Challenge: Reboot Your Spending Habits",
      "summary":"After realising she was spending £150 a month on non-essential items, Amanda challenged herself to a 30-day no-spend month. By the end of the challenge, she saved £120 that month alone. Research by the Office for National Statistics (ONS) suggests that cutting back on discretionary spending can help UK households save thousands annually. This experience helped Amanda realise how much of her spending was out of habit, not necessity.",
      "learning_nugget":"A no-spend challenge can highlight unnecessary expenditures and help reset your spending habits.",
      "fact":"Cutting back on discretionary spending can save UK households thousands annually, according to the ONS."
   },
   {
      "title":"4. Automate Your Savings: Set It and Forget It!",
      "summary":"Amanda was always tempted to spend any extra money she had, so she set up an automatic transfer of 10% of her salary to her savings account. Research from the Money Advice Service shows that those who automate their savings are more likely to stick to their goals. Amanda's automated approach helped her grow her savings by £1,200 in just one year without even thinking about it.",
      "learning_nugget":"Automating your savings removes the temptation to spend and ensures consistent progress toward your financial goals.",
      "fact":"Automated savings significantly increase the likelihood of reaching financial goals, according to the Money Advice Service."
   },
   {
      "title":"5. Sinking Funds: Your Secret Weapon Against Unexpected Expenses",
      "summary":"Amanda was tired of being caught off guard by unexpected expenses like a £300 car repair. She started creating sinking funds—small savings pots for specific future expenses. A survey by the Financial Capability Strategy for the UK found that 28% of UK adults would struggle to cover an unexpected bill of £500. By setting aside £40 monthly for her car, Amanda avoided dipping into her emergency fund when repairs were needed.",
      "learning_nugget":"Sinking funds prepare you for irregular expenses, preventing financial emergencies from disrupting your savings goals.",
      "fact":"28% of UK adults would struggle to cover an unexpected £500 expense, highlighting the importance of sinking funds."
   },
   {
      "title":"6. From Debt to Savings: The Snowball Method Explained",
      "summary":"When Amanda first heard about the snowball method, she was skeptical. But after paying off her smallest debt of £400, she gained the motivation to tackle larger ones. Research by the Debt Advisory Centre shows that the psychological boost from small victories encourages continued progress. Amanda's success using this method allowed her to reduce her total debt by 25% within a year and start contributing more to her savings.",
      "learning_nugget":"The snowball method provides psychological motivation by focusing on quick wins, making it easier to stay committed to paying off debt.",
      "fact":"The Debt Advisory Centre notes that small victories in debt repayment boost motivation, leading to greater long-term success."
   },
   {
      "title":"7. Boost Your Income: Side Hustles That Actually Work",
      "summary":"Amanda knew that to reach her financial goals faster, she needed to increase her income. She explored different side hustles, like freelancing and selling handmade crafts. According to research by Henley Business School, 1 in 4 UK adults have a side job. Amanda found a gig that earned her an additional £300 a month, which she used to pay off debt quicker and increase her savings by £2,500 in one year.",
      "learning_nugget":"A side hustle can significantly boost your income, helping you reach financial goals faster.",
      "fact":"1 in 4 UK adults have a side job, contributing to their financial resilience and savings."
   },
   {
      "title":"8. The Envelope System: Old-School Budgeting for the Modern Saver",
      "summary":"Struggling to stick to her budget, Amanda turned to the envelope system. She allocated £200 into different envelopes for groceries, entertainment, and other expenses. Research by the University of Edinburgh found that using cash instead of cards can reduce spending by 20%. By using this method, Amanda cut her spending by 15% and increased her savings by £80 each month.",
      "learning_nugget":"The envelope system helps you control spending by making your budget more tangible and real.",
      "fact":"Cash-based budgeting systems like the envelope system can reduce spending by 20%, according to the University of Edinburgh."
   },
   {
      "title":"9. Mindful Spending: How to Make Every Pound Count",
      "summary":"Amanda used to spend impulsively, especially online. After embracing mindful spending, she started questioning every purchase. A study by the University of Cambridge found that mindful spending can reduce unnecessary purchases by 30%. By aligning her spending with her values, Amanda cut her discretionary spending by 20%, freeing up more money for savings and investments.",
      "learning_nugget":"Mindful spending helps you align your purchases with your values, leading to more intentional and meaningful use of money.",
      "fact":"Mindful spending can reduce unnecessary purchases by 30%, according to the University of Cambridge."
   },
   {
      "title":"10. Financial Wellness: Building a Positive Money Mindset",
      "summary":"Amanda's journey wasn't just about saving and paying off debt; it was about changing her relationship with money. Research by the UK Mental Health Foundation shows that 74% of UK adults feel stressed about money. By focusing on financial wellness and adopting a positive money mindset, Amanda learned to view money as a tool for achieving her dreams rather than a source of stress. This shift helped her create lasting financial habits that improved her overall well-being.",
      "learning_nugget":"A positive money mindset transforms how you manage finances, reducing stress and helping you achieve long-term goals.",
      "fact":"74% of UK adults feel stressed about money, underscoring the importance of a healthy financial mindset, according to the UK Mental Health Foundation."
   }
],
  "imageSrc": savingsJar
}];

export default function SavingsSeries() {
  const [currentView, setCurrentView] = useState('carousel');
  const [currentCourseIndex, setCurrentCourseIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([]);

  const currentCourse = courses[currentCourseIndex];
  const totalLessons = currentCourse.content.length;
  const progress = ((currentLessonIndex + 1) / totalLessons) * 100;

  const navigateLesson = (direction) => {
    if (direction === 'next' && currentLessonIndex < totalLessons - 1) {
      setCurrentLessonIndex(prev => prev + 1);
      // Mark as completed when moving forward
      if (!completedLessons.includes(currentLessonIndex)) {
        setCompletedLessons([...completedLessons, currentLessonIndex]);
      }
    } else if (direction === 'prev' && currentLessonIndex > 0) {
      setCurrentLessonIndex(prev => prev - 1);
    }
  };

  const variants = {
    enter: (direction) => ({
      opacity: 0,
      x: direction > 0 ? 100 : -100
    }),
    center: { opacity: 1, x: 0 },
    exit: (direction) => ({
      opacity: 0,
      x: direction > 0 ? -100 : 100
    })
  };

  return (
    <div className="courses-container">
      <AnimatePresence mode="wait" custom={1}>
        {currentView === 'carousel' && (
          <motion.div
            key="carousel"
            initial="enter"
            animate="center"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.3 }}
            className="course-carousel"
          >
            <h2 className="section-title">Courses</h2>
            
            <motion.div 
              className="course-card"
              whileHover={{ scale: 1.02 }}
            >
              <img src={currentCourse.imageSrc} alt="" className="course-image" />
              <h3 className="course-title">{currentCourse.title}</h3>
              <p className="course-author">by Easy Finance</p>
              
              <div className="progress-container">
                <div className="progress-bar">
                  <motion.div 
                    className="progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="progress-text">
                  {Math.round(progress)}% completed
                </span>
              </div>
              
              <button 
                onClick={() => {
                  setCurrentView('lessons');
                  setCurrentLessonIndex(0);
                }}
                className="enroll-button"
              >
                {progress > 0 ? 'Continue Learning' : 'Start Course'}
              </button>
            </motion.div>

            <div className="carousel-controls">
              <button 
                onClick={() => setCurrentCourseIndex(
                  (prev) => (prev - 1 + courses.length) % courses.length
                )}
                className="nav-button"
              >
                ← Previous Course
              </button>
              <button 
                onClick={() => setCurrentCourseIndex(
                  (prev) => (prev + 1) % courses.length
                )}
                className="nav-button"
              >
                Next Course →
              </button>
            </div>
          </motion.div>
        )}

        {currentView === 'lessons' && (
          <motion.div
            key="lessons"
            initial="enter"
            animate="center"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.3 }}
            className="lessons-view"
          >
            {/* <div className="lesson-header"> */}
              <button 
                onClick={() => setCurrentView('carousel')}
                className="back-button"
              >
                ← Back to Course
              </button>
              <div className="progress-container">
                <div className="progress-bar">
                  <motion.div 
                    className="progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="progress-text">
                  Lesson {currentLessonIndex + 1} of {totalLessons}
                </span>
              </div>
            {/* </div> */}

            <h2 className="course-title">{currentCourse.title}</h2>
            
            <AnimatePresence mode="wait" custom={currentLessonIndex}>
              <motion.div
                key={currentLessonIndex}
                custom={1}
                initial="enter"
                animate="center"
                exit="exit"
                variants={variants}
                transition={{ duration: 0.3 }}
                className="lesson-content"
              >
                <h3>{currentCourse.content[currentLessonIndex].title}</h3>
                <p>{currentCourse.content[currentLessonIndex].summary}</p>
                <div className="nugget">
                  <strong>Key Takeaway:</strong> {currentCourse.content[currentLessonIndex].learning_nugget}
                </div>
                <div className="fact">
                  <strong>Did You Know?</strong> {currentCourse.content[currentLessonIndex].fact}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="lesson-controls">
              <button 
                onClick={() => navigateLesson('prev')}
                disabled={currentLessonIndex === 0}
                className="nav-button"
              >
                ← Previous Lesson
              </button>
              
              {currentLessonIndex < totalLessons - 1 ? (
                <button 
                  onClick={() => navigateLesson('next')}
                  className="nav-button primary"
                >
                  Next Lesson →
                </button>
              ) : (
                <button 
                  onClick={() => setCurrentView('carousel')}
                  className="nav-button complete"
                >
                  Complete Course ✓
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}