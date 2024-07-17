import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { supabase } from '../client'; // Ensure your Supabase client is correctly imported
import { useAuth0 } from '@auth0/auth0-react';
import ExerciseForm from './ExerciseForm'; // Import ExerciseForm from the correct path
import './LessonManagement.css'; // CSS for custom styling

const LessonManagement = () => {
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [imageUrl, setImageUrl] = useState(''); // State for image URL
  const [lessonId, setLessonId] = useState(null); // State to track the selected lesson ID
  const { isAuthenticated, user } = useAuth0();

  const handleTitleChange = (e) => setLessonTitle(e.target.value);
  const handleDescriptionChange = (e) => setLessonDescription(e.target.value);

  const handleLessonSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = user.sub; // Get user ID from Auth0
      const { data: lessonData, error: lessonError } = await supabase.from('lessons').insert([
        {
          title: lessonTitle,
          description: lessonDescription,
          created_by: userId, // Use 'created_by' as 'user_id'
          video_url: videoUrl || null,
          pdf_url: pdfUrl || null,
          image_url: imageUrl || null, // Include image URL
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (lessonError) {
        console.error('Error inserting lesson:', lessonError.message);
        alert('Failed to upload lesson. Please try again.');
        return;
      }

      console.log('Lesson inserted successfully:', lessonData);
      setLessonId(lessonData[0].id); // Update lesson ID after insertion
      resetForm();
      alert('Lesson uploaded successfully!');
    } catch (error) {
      console.error('Error handling lesson upload:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  const resetForm = () => {
    setLessonTitle('');
    setLessonDescription('');
    setVideoUrl('');
    setPdfUrl('');
    setImageUrl(''); // Reset image URL
  };

  const handleUploadClick = (fileType) => {
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: 'dp2jwmyma',
        uploadPreset: 'xtd2dztq',
        sources: ['local', 'url', 'camera'],
        multiple: false,
        resourceType: 'auto',
        maxFileSize: 50000000,
        maxFiles: 1,
        clientAllowedFormats: ['pdf', 'mp4', 'jpg', 'png'], // Allow image formats
        uploadSignatureTimestamp: Date.now(),
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return;
        }
        if (result.event === 'success') {
          const url = result.info.secure_url;
          if (fileType === 'video') {
            setVideoUrl(url);
          } else if (fileType === 'pdf') {
            setPdfUrl(url);
          } else if (fileType === 'image') {
            setImageUrl(url); // Handle image upload
          }
        }
      }
    );
    widget.open();
  };

  const handleExerciseSubmit = async (exerciseData) => {
    try {
      const { data, error } = await supabase.from('exercises').insert([
        {
          lesson_id: exerciseData.lesson_id,
          title: exerciseData.title,
          description: exerciseData.description,
          type: exerciseData.type,
          content: exerciseData.content,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error('Error inserting exercise:', error.message);
        alert('Failed to add exercise. Please try again.');
      } else {
        console.log('Exercise inserted successfully:', data);
        alert('Exercise added successfully!');
      }
    } catch (error) {
      console.error('Error handling exercise submission:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="lesson-management">
      <h2>Manage Lessons and Exercises</h2>
      <Form onSubmit={handleLessonSubmit}>
        <Form.Group controlId="lessonTitle">
          <Form.Label>Lesson Title</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter lesson title"
            value={lessonTitle}
            onChange={handleTitleChange}
          />
        </Form.Group>

        <Form.Group controlId="lessonDescription">
          <Form.Label>Lesson Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Enter lesson description"
            value={lessonDescription}
            onChange={handleDescriptionChange}
          />
        </Form.Group>

        <Button variant="primary" onClick={() => handleUploadClick('video')}>
          Upload Video (optional)
        </Button>

        <Button variant="primary" onClick={() => handleUploadClick('pdf')}>
          Upload PDF (optional)
        </Button>
        
        <Button variant="primary" onClick={() => handleUploadClick('image')}>
          Upload Image (optional)
        </Button>

        <Button variant="primary" type="submit">
          Upload Lesson
        </Button>
      </Form>

      {lessonId && <ExerciseForm lessonId={lessonId} onSubmit={handleExerciseSubmit} />}
    </div>
  );
};

export default LessonManagement;
