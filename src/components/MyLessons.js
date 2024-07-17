import React, { useEffect, useState } from 'react';
import { supabase } from '../client'; // Import your Supabase client
import { useAuth0 } from '@auth0/auth0-react';
import './MyLesoons.css'; // Ensure to import your CSS file
import 'font-awesome/css/font-awesome.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faVideo, faFilePdf, faTrashAlt } from '@fortawesome/free-solid-svg-icons';




const MyLessons = () => {
  const [lessons, setLessons] = useState([]);
  const [showExercises, setShowExercises] = useState({});
  const { user } = useAuth0();
  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    const fetchLessonsAndExercises = async () => {
      if (!user) return;
  
      try {
        const { data: lessonData, error: lessonError } = await supabase
          .from('lessons')
          .select('*')
          .eq('created_by', user.sub);
  
        if (lessonError) throw lessonError;
  
        setLessons(lessonData);
  
        const { data: exerciseData, error: exerciseError } = await supabase
          .from('exercises')
          .select('*')
          .in('lesson_id', lessonData.map(lesson => lesson.id));
  
        if (exerciseError) throw exerciseError;
  
        setExercises(exerciseData);
      } catch (error) {
        console.error('Error fetching data:', error.message);
      }
    };
  
    fetchLessonsAndExercises();
  }, [user]);

  const handleToggleExercises = (lessonId) => {
    setShowExercises((prev) => ({
      ...prev,
      [lessonId]: !prev[lessonId],
    }));
  };

  const handleUploadClick = (fileType, lessonId) => {
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: 'dp2jwmyma',
        uploadPreset: 'xtd2dztq',
        sources: ['local', 'url', 'camera'],
        multiple: false,
        resourceType: fileType,
        clientAllowedFormats: fileType === 'image' ? ['jpg', 'png'] : ['pdf', 'mp4'],
      },
      async (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return;
        }
        if (result.event === 'success') {
          const url = result.info.secure_url;
          const { error: updateError } = await supabase
            .from('lessons')
            .update({ [`${fileType}_url`]: url })
            .eq('id', lessonId);

          if (updateError) {
            console.error('Error updating URL:', updateError.message);
          } else {
            setLessons((prevLessons) =>
              prevLessons.map((lesson) =>
                lesson.id === lessonId ? { ...lesson, [`${fileType}_url`]: url } : lesson
              )
            );
          }
        }
      }
    );
    widget.open();
  };

  const handleDeleteLesson = async (lessonId) => {
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', lessonId);

    if (error) {
      console.error('Error deleting lesson:', error.message);
    } else {
      setLessons(lessons.filter(lesson => lesson.id !== lessonId));
    }
  };

  const handleDeleteFile = async (fileType, lessonId) => {
    const { error } = await supabase
      .from('lessons')
      .update({ [`${fileType}_url`]: null })
      .eq('id', lessonId);

    if (error) {
      console.error(`Error deleting ${fileType}:`, error.message);
    } else {
      setLessons((prevLessons) =>
        prevLessons.map((lesson) =>
          lesson.id === lessonId ? { ...lesson, [`${fileType}_url`]: null } : lesson
        )
      );
    }
  };

  return (
    <div className="my-lessons">
      <h1 className="mb-4">🎶 My Lesoons🎶</h1>
      <div className="lessons-container">
        {lessons.length === 0 ? (
          <p>No lessons found.</p>
        ) : (
          lessons.map((lesson) => (
            <div 
              key={lesson.id} 
              className="lesson-card" 
              style={{ backgroundImage: `url(${lesson.image_url})` }}
            >
              <div className="lesson-overlay">
              
  
  <div className="menu">
  <button className="menu-btn">⋮</button>
  <div className="menu-content">
    <button onClick={() => handleUploadClick('image', lesson.id)} className="menu-item">
      <FontAwesomeIcon icon={faImage} /> Update Image
    </button>
    <button onClick={() => handleUploadClick('video', lesson.id)} className="menu-item">
      <FontAwesomeIcon icon={faVideo} /> Update Video
    </button>
    <button onClick={() => handleUploadClick('pdf', lesson.id)} className="menu-item">
      <FontAwesomeIcon icon={faFilePdf} /> Update PDF
    </button>
    <button onClick={() => handleDeleteLesson(lesson.id)} className="menu-item">
      <FontAwesomeIcon icon={faTrashAlt} /> Delete Lesson
    </button>
    <button onClick={() => handleDeleteFile('image', lesson.id)} className="menu-item">
      <FontAwesomeIcon icon={faTrashAlt} /> Delete Image
    </button>
    <button onClick={() => handleDeleteFile('video', lesson.id)} className="menu-item">
      <FontAwesomeIcon icon={faTrashAlt} /> Delete Video
    </button>
    <button onClick={() => handleDeleteFile('pdf', lesson.id)} className="menu-item">
      <FontAwesomeIcon icon={faTrashAlt} /> Delete PDF
    </button>
  </div>
</div>


                <h3 className="card-title">{lesson.title}</h3>
                <p className="card-text">{lesson.description}</p>
                {lesson.pdf_url && (
                  <a href={lesson.pdf_url} target="_blank" rel="noopener noreferrer" className="btn1 btn1-bold"> PDF</a>
                )}
                {lesson.video_url && (
                  <a href={lesson.video_url} target="_blank" rel="noopener noreferrer" className="btn1 btn1-bold"> Video</a>
                )}
                <button className="btn toggle-exercises" onClick={() => handleToggleExercises(lesson.id)}>
                  {showExercises[lesson.id] ? 'Hide Exercises' : 'View Exercises'}
                </button>
                {showExercises[lesson.id] && (
                  <div className="exercises-list">
                    {exercises.filter(exercise => exercise.lesson_id === lesson.id).map(exercise => (
                      <div key={exercise.id} className="exercise-card">
                        <h4 className="exercise-title">{exercise.title}</h4>
                        <p className="exercise-description">{exercise.description}</p>
                        <div className="questions-list">
                          {exercise.questions && exercise.questions.map(question => (
                            <div key={question.id} className="question-item">
                              <p>{question.question_text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyLessons;
