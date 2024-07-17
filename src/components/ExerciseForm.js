import React, { useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { supabase } from '../client';
import './ExerciseForm.css'; // Fichier CSS pour le style personnalisé

const ExerciseForm = ({ lessonId, onSubmit }) => {
  const [exerciseTitle, setExerciseTitle] = useState('');
  const [exerciseDescription, setExerciseDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentAnswers, setCurrentAnswers] = useState([]);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(-1);

  const addQuestion = () => {
    if (currentQuestion.trim() === '' || currentAnswers.length === 0) return;
    const newQuestion = {
      question_text: currentQuestion,
      answers: currentAnswers.map((answer, index) => ({
        answer_text: answer,
        is_correct: index === correctAnswerIndex,
      })),
    };
    setQuestions([...questions, newQuestion]);
    setCurrentQuestion('');
    setCurrentAnswers([]);
    setCorrectAnswerIndex(-1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Insertion de l'exercice dans Supabase
      const { data: exerciseData, error: exerciseError } = await supabase.from('exercises').insert([
        {
          lesson_id: lessonId,
          title: exerciseTitle,
          description: exerciseDescription,
          type: 'quiz',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (exerciseError) {
        console.error('Error inserting exercise:', exerciseError.message);
        alert('Failed to add exercise. Please try again.');
        return;
      }

      console.log('Exercise inserted successfully:', exerciseData);

      // Insertion de chaque question avec ses réponses dans Supabase
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];

        // Insertion de la question dans la table `questions`
        const { data: questionData, error: questionError } = await supabase.from('questions').insert([
          {
            exercise_id: exerciseData[0].id,
            question_text: question.question_text,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);

        if (questionError) {
          console.error('Error inserting question:', questionError.message);
          alert('Failed to add question. Please try again.');
          return;
        }

        console.log('Question inserted successfully:', questionData);

        // Insertion de chaque réponse dans la table `answers`
        for (let j = 0; j < question.answers.length; j++) {
          const answer = question.answers[j];

          const { data: answerData, error: answerError } = await supabase.from('answers').insert([
            {
              question_id: questionData[0].id,
              answer_text: answer.answer_text,
              is_correct: answer.is_correct,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]);

          if (answerError) {
            console.error('Error inserting answer:', answerError.message);
            alert('Failed to add answer. Please try again.');
            return;
          }

          console.log('Answer inserted successfully:', answerData);
        }
      }

      // Réinitialisation du formulaire après soumission
      setExerciseTitle('');
      setExerciseDescription('');
      setQuestions([]);

      alert('Exercise and questions uploaded successfully!');
    } catch (error) {
      console.error('Error handling exercise submission:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="exercise-form">
      <Form.Group controlId="exerciseTitle">
        <Form.Label>Exercise Title</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter exercise title"
          value={exerciseTitle}
          onChange={(e) => setExerciseTitle(e.target.value)}
        />
      </Form.Group>

      <Form.Group controlId="exerciseDescription">
        <Form.Label>Exercise Description</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="Enter exercise description"
          value={exerciseDescription}
          onChange={(e) => setExerciseDescription(e.target.value)}
        />
      </Form.Group>

      {questions.map((question, qIndex) => (
        <div key={qIndex} className="question-container">
          <h5 className="question-title">Question {qIndex + 1}: {question.question_text}</h5>
          <ul className="answer-list">
            {question.answers.map((answer, aIndex) => (
              <li key={aIndex} className={`answer-item ${answer.is_correct ? 'correct-answer' : 'incorrect-answer'}`}>
                {answer.answer_text}
              </li>
            ))}
          </ul>
        </div>
      ))}

      <Form.Group controlId="currentQuestion">
        <Form.Label>Add Question</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter question"
          value={currentQuestion}
          onChange={(e) => setCurrentQuestion(e.target.value)}
        />
        <Row>
          <Col>
            <Form.Control
              type="text"
              placeholder="Enter answer"
              value={currentAnswers[0] || ''}
              onChange={(e) => setCurrentAnswers([e.target.value, currentAnswers[1], currentAnswers[2]])}
            />
          </Col>
          <Col>
            <Form.Control
              type="text"
              placeholder="Enter answer"
              value={currentAnswers[1] || ''}
              onChange={(e) => setCurrentAnswers([currentAnswers[0], e.target.value, currentAnswers[2]])}
            />
          </Col>
          <Col>
            <Form.Control
              type="text"
              placeholder="Enter answer"
              value={currentAnswers[2] || ''}
              onChange={(e) => setCurrentAnswers([currentAnswers[0], currentAnswers[1], e.target.value])}
            />
          </Col>
          <Col>
            <Form.Control
              as="select"
              value={correctAnswerIndex}
              onChange={(e) => setCorrectAnswerIndex(parseInt(e.target.value))}
            >
              <option value={-1}>Select correct answer</option>
              {currentAnswers.map((answer, index) => (
                <option key={index} value={index}>{`Answer ${index + 1}`}</option>
              ))}
            </Form.Control>
          </Col>
        </Row>
      </Form.Group>

      <Row>
        <Col>
          <Button variant="primary" type="button" className="add-question-button" onClick={addQuestion}>
            Add Question
          </Button>
        </Col>
        <Col>
          <Button variant="primary" type="submit" className="add-exercise-button">
            Add Exercise
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default ExerciseForm;
