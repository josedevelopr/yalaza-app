import React from 'react';
import AnswerAndQuestion from './AnswerAndQuestion';

const FrequentAnswerAndQuestions = () => {
  const faqs = [
    { question: '¿Puedo crear eventos gratis?', answer: 'Sí. Crear eventos y validar demanda con pre-reservas no tiene costo. Solo cobramos una pequeña comisión cuando vendes entradas.' },
    { question: '¿Cuándo recibo mi dinero?', answer: 'Los pagos se procesan automáticamente y se depositan según el método de cobro que configures en tu panel.' },
    { question: '¿Qué pasa si mi evento no se llena?', answer: 'Nada grave. Puedes ajustar precio, promoción o cancelar sin penalidad antes de publicar oficialmente.' },
    { question: '¿Puedo cambiar los datos después?', answer: 'Sí. Puedes editar fecha, descripción y detalles mientras tu evento esté en borrador.' }
  ];

  return (
    <div className="wrap events-grid">
      {faqs.map((item, index) => (
        <AnswerAndQuestion 
          key={index}
          question={item.question}
          answer={item.answer}
        />
      ))}
    </div>
  );
};

export default FrequentAnswerAndQuestions;