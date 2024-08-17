import React, { useState, useContext, createContext } from 'react';
import { Box, Button, VStack, HStack, Progress, Text, IconButton } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { FaStar } from 'react-icons/fa';
import savingsJar from '../resources/savingsJar.svg';

// Mock articles data
const courses = [{
  "title":"Money Master Class",
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
        "summary":"Amanda was always tempted to spend any extra money she had, so she set up an automatic transfer of 10% of her salary to her savings account. Research from the Money Advice Service shows that those who automate their savings are more likely to stick to their goals. Amanda’s automated approach helped her grow her savings by £1,200 in just one year without even thinking about it.",
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
        "summary":"When Amanda first heard about the snowball method, she was skeptical. But after paying off her smallest debt of £400, she gained the motivation to tackle larger ones. Research by the Debt Advisory Centre shows that the psychological boost from small victories encourages continued progress. Amanda’s success using this method allowed her to reduce her total debt by 25% within a year and start contributing more to her savings.",
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
        "summary":"Amanda’s journey wasn’t just about saving and paying off debt; it was about changing her relationship with money. Research by the UK Mental Health Foundation shows that 74% of UK adults feel stressed about money. By focusing on financial wellness and adopting a positive money mindset, Amanda learned to view money as a tool for achieving her dreams rather than a source of stress. This shift helped her create lasting financial habits that improved her overall well-being.",
        "learning_nugget":"A positive money mindset transforms how you manage finances, reducing stress and helping you achieve long-term goals.",
        "fact":"74% of UK adults feel stressed about money, underscoring the importance of a healthy financial mindset, according to the UK Mental Health Foundation."
     }
  ],
  "imageSrc":savingsJar
}]

export default function SavingsSeries(){

   const [breadcrumbs, setBreadcrumbs] = useState([]);
   const [showCourseContainer, setShowCourseContainer] = useState(true)
   const [showCourseView, setShowCourseView] = useState(false);
   const [showCourseContent, setShowCourseContent] = useState(false);
   const [activeCourseIndex, setActiveCourseIndex] = useState(0);
   const [activeLessonIndex, setActiveLessonIndex] = useState(0);

  return <div className='courses'>
    <span className="fin-emph">Courses</span>
    <div className="list-of-courses">
        {courses.map(course => {
          return <div >
            <div className="breadcrumbs"></div>
            <div className="course-container"><img className="course-image" src={course.imageSrc} alt=""/><div><span className="course-title">{course.title}</span><p className="course-credits">by<br></br>Easy Finance</p></div><button type="button" onClick={()=>{
               setBreadcrumbs(breadcrumbs.push('Courses'));
               setBreadcrumbs(breadcrumbs.push(course.title));
            }}>Enroll</button></div>
            <div className="course-view"></div>
            <div className="course-content">{course.content.map(item => {
              return <div className="course-content-container"> <span>{item.title}</span>
               <p>{item.summary}</p><p>{item.learning_nugget}</p><p>{item.fact}</p></div>
            })}</div>
          </div>
        })}
    </div>
  </div>
}

// // Create a context to manage the user's progress and selected modules
// const CourseContext = createContext();

// const CourseProvider = ({ children }) => {
//   const [progress, setProgress] = useState(0);
//   const [completedModules, setCompletedModules] = useState([]);
//   const [selectedModules, setSelectedModules] = useState(articles);

//   const completeModule = (index) => {
//     if (!completedModules.includes(index)) {
//       setCompletedModules([...completedModules, index]);
//       setProgress((completedModules.length + 1) / selectedModules.length * 100);
//     }
//   };

//   return (
//     <CourseContext.Provider value={{ progress, completedModules, completeModule, selectedModules, setSelectedModules }}>
//       {children}
//     </CourseContext.Provider>
//   );
// };

// const Module = ({ article, index }) => {
//   const { completedModules, completeModule } = useContext(CourseContext);
//   const [isOpen, setIsOpen] = useState(false);

//   const toggleOpen = () => setIsOpen(!isOpen);

//   return (
//     <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//       <Box 
//         p={5} 
//         shadow='md' 
//         borderWidth='1px' 
//         borderRadius='md' 
//         bg={completedModules.includes(index) ? 'green.100' : 'white'}
//         onClick={toggleOpen}
//       >
//         <HStack justifyContent="space-between">
//           <Text fontWeight="bold">{article.title}</Text>
//           <IconButton icon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />} />
//         </HStack>
//         {isOpen && (
//           <motion.div
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: 'auto' }}
//             transition={{ duration: 0.5 }}
//           >
//             <Text mt={4}>{article.summary}</Text>
//             {!completedModules.includes(index) && (
//               <Button mt={4} colorScheme="green" onClick={() => completeModule(index)}>
//                 Complete Module
//               </Button>
//             )}
//           </motion.div>
//         )}
//       </Box>
//     </motion.div>
//   );
// };

// const ProgressTracker = () => {
//   const { progress } = useContext(CourseContext);
//   return (
//     <Box p={5}>
//       <Text mb={2} fontWeight="bold">Course Progress</Text>
//       <Progress value={progress} colorScheme="green" />
//     </Box>
//   );
// };

// const Course = () => {
//   const { selectedModules } = useContext(CourseContext);
  
//   return (
//     <VStack spacing={6}>
//       <ProgressTracker />
//       {selectedModules.map((article, index) => (
//         <Module key={index} article={article} index={index} />
//       ))}
//     </VStack>
//   );
// };

// const CustomLearningPath = () => {
//   const { selectedModules, setSelectedModules } = useContext(CourseContext);
//   const [difficulty, setDifficulty] = useState('medium');

//   const reorderModules = (fromIndex, toIndex) => {
//     const updatedModules = [...selectedModules];
//     const [movedModule] = updatedModules.splice(fromIndex, 1);
//     updatedModules.splice(toIndex, 0, movedModule);
//     setSelectedModules(updatedModules);
//   };

//   return (
//     <Box>
//       <Text fontWeight="bold">Customize Your Learning Path</Text>
//       {/* Add reordering and difficulty selection functionality */}
//       {/* For simplicity, only a stub is provided here */}
//     </Box>
//   );
// };

// const CourseComponent = () => {
//   return (
//     <CourseProvider>
//       <Box p={5} maxW="lg" mx="auto">
//         <Text fontSize="2xl" fontWeight="bold" mb={4}>Financial Wellness Journey with Alex</Text>
//         <Text mb={8}>Follow Alex's journey to financial wellness as you complete each module.</Text>
//         <CustomLearningPath />
//         <Course />
//       </Box>
//     </CourseProvider>
//   );
// };

// export default CourseComponent;

