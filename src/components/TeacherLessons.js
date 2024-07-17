import React, { useState, useEffect,useRef } from 'react';
import { Button, Card, Form ,InputGroup} from 'react-bootstrap';
import { supabase } from '../client'; // Import your Supabase client
import './TeacherLessons.css'; // Custom CSS file for styles
import backgroundImage from '../components/images/backk.jpg'; // Import the image
import { FaSearch } from 'react-icons/fa'; // Importer l'icône de recherche

const TeacherLessons = () => {
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [quizResponses, setQuizResponses] = useState([]);
  const [score, setScore] = useState(0);
  const [quizSubmitted, setQuizSubmitted] = useState(false); // Track quiz submission
  const videoRefs = useRef({});
  const [searchQuery, setSearchQuery] = useState('');


  // Load lessons from the database
  useEffect(() => {
    const fetchLessons = async () => {
      const { data: lessonsData, error } = await supabase.from('lessons').select('*');
      if (error) {
        console.error('Error fetching lessons:', error.message);
        return;
      }
      setLessons(lessonsData);
    };

    fetchLessons();
  }, []);
   // Filter lessons based on the search query
   const filteredLessons = lessons.filter((lesson) =>
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  

  // Fetch exercises for a specific lesson
  const fetchExercises = async (lessonId) => {
    const { data: exercisesData, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('lesson_id', lessonId);

    if (error) {
      console.error('Error fetching exercises:', error.message);
      return [];
    }

    const exercisesWithQuestions = await Promise.all(
      exercisesData.map(async (exercise) => {
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .eq('exercise_id', exercise.id);

        if (questionsError) {
          console.error('Error fetching questions:', questionsError.message);
          return { ...exercise, questions: [] };
        }

        const questionsWithAnswers = await Promise.all(
          questionsData.map(async (question) => {
            const { data: answersData, error: answersError } = await supabase
              .from('answers')
              .select('*')
              .eq('question_id', question.id);

            if (answersError) {
              console.error('Error fetching answers:', answersError.message);
              return { ...question, answers: [] };
            }

            return { ...question, answers: answersData };
          })
        );

        return { ...exercise, questions: questionsWithAnswers };
      })
    );

    return exercisesWithQuestions;
  };

  // Handle quiz submission
  const handleSubmitQuiz = (e) => {
    e.preventDefault();
    let newScore = 0;
    const updatedResponses = quizResponses.map((response) => {
      const question = selectedLesson.exercises
        .flatMap((exercise) => exercise.questions)
        .find((q) => q.id === response.questionId);
      const selectedAnswer = question.answers.find(
        (answer) => answer.id === response.selectedAnswer
      );

      if (selectedAnswer && selectedAnswer.is_correct) {
        newScore++;
        return { ...response, isCorrect: true };
      } else {
        const correctAnswer = question.answers.find((answer) => answer.is_correct);
        return {
          ...response,
          isCorrect: false,
          correctAnswerText: correctAnswer ? correctAnswer.answer_text : 'Correct answer not found',
        };
      }
    });

    setScore(newScore);
    setQuizResponses(updatedResponses);
    setQuizSubmitted(true);
  };

  // Handle response change for quiz questions
  const handleQuizResponseChange = (questionId, selectedAnswer) => {
    const updatedResponses = quizResponses.map((response) => {
      if (response.questionId === questionId) {
        return {
          ...response,
          selectedAnswer,
        };
      }
      return response;
    });

    setQuizResponses(updatedResponses);
  };
  const handleOpenPdfAndVideo = (lesson) => {
    setSelectedLesson(lesson);
    if (videoRefs.current[lesson.id]) {
      videoRefs.current[lesson.id].play();
    }
  };

  // Render quiz details and allow responses
  const renderQuiz = () => {
    if (!selectedLesson || !selectedLesson.exercises) {
      return (
        <div className="quiz-container">
          <p>No lesson selected or no exercises found.</p>
        </div>
      );
    }
    

    return (
      <div className="quiz-container">
        <h4>Quiz for Lesson: {selectedLesson.title}</h4>
        <Form onSubmit={handleSubmitQuiz}>
          {selectedLesson.exercises.map((exercise) => (
            <div key={exercise.id}>
              <h5>{exercise.title}</h5>
              {exercise.questions.map((question) => {
                const response = quizResponses.find(
                  (res) => res.questionId === question.id
                );
                const isCorrect = response && response.selectedAnswer 
                  && question.answers.find((ans) => ans.id === response.selectedAnswer)?.is_correct;

                return (
                  <Card
                    key={question.id}
                    className={`exercise-card ${
                      quizSubmitted && isCorrect ? 'correct' : ''
                    } ${quizSubmitted && !isCorrect ? 'incorrect' : ''}`}
                  >
                    <Card.Body>
                      <Card.Title>{question.question_text}</Card.Title>
                      <Form.Group controlId={`question-${question.id}`}>
                        {question.answers.map((answer) => (
                          <Form.Check
                            key={answer.id}
                            type="radio"
                            id={`answer-${answer.id}`}
                            label={answer.answer_text}
                            checked={response?.selectedAnswer === answer.id}
                            onChange={() =>
                              handleQuizResponseChange(question.id, answer.id)
                            }
                            disabled={quizSubmitted} // Disable inputs after submission
                          />
                        ))}
                      </Form.Group>
                      {quizSubmitted && !isCorrect && (
                        <p className="correct-answer">
                          Correct Answer: <strong>{response.correctAnswerText}</strong>
                        </p>
                      )}
                    </Card.Body>
                  </Card>
                );
              })}
            </div>
          ))}
          {!quizSubmitted && (
            <Button variant="primary" type="submit">
              Submit Answers
            </Button>
          )}
        </Form>
        {quizSubmitted && (
          <div className="quiz-results">
            <h4>Quiz Results</h4>
            <p>Score: {score}</p>
          </div>
        )}
      </div>
    );
  };

  // Render lessons and associated details
  const renderLessons = () => {
    const filteredLessons = lessons.filter(lesson =>
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      lesson.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return (
      <div
        className="lessons-list"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '20px',
          borderRadius: '10px',
        }}
      >
        {filteredLessons.map((lesson) => (
          <Card
            key={lesson.id}
            className="lesson-card"
            style={{
              backgroundImage: `url(${lesson.image_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '10px',
            }}
          >
            <Card.Body>
              <Card.Title>
                <strong>{lesson.title}</strong>
              </Card.Title>
              <Card.Text>
                <strong>{lesson.description}</strong>
              </Card.Text>
              {lesson.video_url && (
                <div className="video-container1">
                  <video ref={(el) => (videoRefs.current[lesson.id] = el)} controls>
                    <source src={lesson.video_url} type="video/mp4" />
                    Votre navigateur ne supporte pas la balise vidéo.
                  </video>
                </div>
              )}
              {lesson.pdf_url && (
                <div className="pdf-container">
                  <a href={lesson.pdf_url} target="_blank" rel="noopener noreferrer">
                    Ouvrir le PDF
                  </a>
                </div>
              )}
              <Button variant="primary" onClick={() => handleOpenPdfAndVideo(lesson)}>
                Ouvrir PDF et Vidéo
              </Button>
              <Button variant="primary" onClick={() => handleLessonSelect(lesson)}>
                Voir les Exercices
              </Button>
            </Card.Body>
          </Card>
        ))}
      </div>
    );
  };

  // Select a lesson and load its exercises, questions, and answers
  const handleLessonSelect = async (lesson) => {
    setSelectedLesson(lesson);
    const exercises = await fetchExercises(lesson.id);
    const initialResponses = exercises.flatMap((exercise) =>
      exercise.questions.map((question) => ({
        questionId: question.id,
        questionText: question.question_text,
        correctAnswerText: question.answers.find((answer) => answer.is_correct)?.answer_text,
        selectedAnswer: null,
        isCorrect: false,
      }))
    );
    setQuizResponses(initialResponses);
    lesson.exercises = exercises; // Attach exercises to lesson
    setScore(0);
    setQuizSubmitted(false); // Reset quiz submission state
  };

  return (
    <div className="teacher-lessons">
      <h1 className="mb-4">🎶 Teachers lessons 🎧🎤🎻🥁🎸</h1>
      <InputGroup className="mb-3 search-bar">
        <InputGroup.Text>
          <FaSearch />
        </InputGroup.Text>
        <Form.Control
          type="text"
          placeholder="Rechercher une leçon..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '250px' }} // Ajuster la largeur
        />
      </InputGroup>
      <div className="lessons-container">
        <div className="lessons-list-container">{renderLessons()}</div>
        {selectedLesson && renderQuiz()}
      </div>
    </div>
  );
};

export default TeacherLessons;
