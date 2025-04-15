import React, { useState } from 'react';

import Navbar from '../../../generic_comp/navbar';

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

const FAQsPage = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const faqs: FAQ[] = [
    {
      category: 'General',
      question: 'How do I create a new support ticket?',
      answer:
        "To create a new support ticket, click on the 'Create Ticket' button in the dashboard. Fill out the required information including title, description, and category. You can also attach relevant files or screenshots.",
    },
    {
      category: 'General',
      question: 'How can I check the status of my ticket?',
      answer:
        "You can check your ticket status in the dashboard under 'My Tickets'. Each ticket will show its current status (Open, In Progress, Resolved, or Closed).",
    },
    {
      category: 'Technical',
      question: 'What should I do if I encounter a FSSS_BASE error?',
      answer:
        "If you encounter a FSSS_BASE error, first check your vehicle's settings and ensure all connections are secure. If the issue persists, create a ticket with the error details and your vehicle ID.",
    },
    {
      category: 'Technical',
      question: 'How do I resolve common PIN/card issues?',
      answer:
        'For PIN/card issues, verify that the card is properly registered in the system and the PIN matches your records. Try resetting the PIN through the admin panel if necessary.',
    },
    {
      category: 'Account',
      question: 'How do I update my account information?',
      answer:
        'Go to your profile settings in the top right corner. Here you can update your personal information, email preferences, and notification settings.',
    },
    {
      category: 'Vehicle',
      question:
        'What information do I need when reporting a vehicle issue?',
      answer:
        'When reporting a vehicle issue, include: Vehicle ID/Serial number, Current status, Error messages (if any), Time of incident, and Any relevant screenshots or photos.',
    },
    {
      category: 'Vehicle',
      question: 'How do I check vehicle operation history?',
      answer:
        "Vehicle operation history can be viewed in the 'Vehicle Details' section. Enter your vehicle ID to see operation logs, maintenance records, and past issues.",
    },
    {
      category: 'Support',
      question: 'What are your support hours?',
      answer:
        'Our support team is available 24/7 for urgent issues. Regular support hours are Monday to Friday, 9 AM to 6 PM EST.',
    },
  ];

  // Obtener categorías únicas de manera segura en TypeScript
  const categories: string[] = [
    'all',
    ...Array.from(new Set(faqs.map((faq) => faq.category))),
  ];

  const filteredFaqs =
    selectedCategory === 'all'
      ? faqs
      : faqs.filter((faq) => faq.category === selectedCategory);

  return (
    <>
      <Navbar />
      <div className='min-h-screen bg-gray-50 py-8'>
        <div className='max-w-4xl mx-auto px-4'>
          <h1 className='text-3xl font-bold text-teal-600 mb-8 text-center'>
            Frequently Asked Questions
          </h1>

          {/* Category Filter */}
          <div className='flex flex-wrap gap-2 mb-8 justify-center'>
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${
                  selectedCategory === category
                    ? 'bg-teal-600 text-white'
                    : 'bg-white text-teal-600 hover:bg-teal-50 border border-teal-200'
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {/* FAQs */}
          <div className='space-y-4'>
            {filteredFaqs.map((faq, index) => (
              <div
                key={index}
                className='bg-white rounded-lg shadow-md overflow-hidden'
              >
                <button
                  className='w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none'
                  onClick={() =>
                    setActiveIndex(activeIndex === index ? null : index)
                  }
                >
                  <span className='font-medium text-gray-900'>
                    {faq.question}
                  </span>
                  <span
                    className={`transform transition-transform ${
                      activeIndex === index ? 'rotate-180' : ''
                    }`}
                  >
                    <svg
                      className='w-5 h-5 text-gray-500'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        d='M19 9l-7 7-7-7'
                      />
                    </svg>
                  </span>
                </button>
                {activeIndex === index && (
                  <div className='px-6 py-4 bg-gray-50'>
                    <p className='text-gray-600'>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* contact_name Support */}
          <div className='mt-12 text-center'>
            <p className='text-gray-600'>
              Can't find what you're looking for?
            </p>
            <button className='mt-4 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors'>
              contact_name Support
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FAQsPage;
