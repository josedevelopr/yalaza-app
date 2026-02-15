import React from 'react';

const AnswerAndQuestion = ({ question, answer }) => {
  return (
    <div className="glass faq-card">
      <div className="faq-question">{question}</div>
      <div className="faq-answer">{answer}</div>
    </div>
  );
};

export default AnswerAndQuestion;