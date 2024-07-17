import React, { useState, useEffect } from 'react';
import { supabase } from '../client';
import { useAuth0 } from '@auth0/auth0-react';
import "./Comments.css";


function Forums() {
  const { isAuthenticated, user } = useAuth0();
  const [forums, setForums] = useState([]);
  const [selectedForum, setSelectedForum] = useState(null);
  const [newPost, setNewPost] = useState('');

  useEffect(() => {
    fetchForums();
  }, []);

  const fetchForums = async () => {
    try {
      const { data, error } = await supabase.from('forums').select('*');
      if (error) throw error;
      setForums(data);
    } catch (error) {
      console.error('Error fetching forums:', error.message);
    }
  };

  const fetchPosts = async (forumId) => {
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .select('*')
        .eq('forum_id', forumId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSelectedForum({ id: forumId, posts: data });
    } catch (error) {
      console.error('Error fetching posts:', error.message);
    }
  };

  const handleAddPost = async () => {
    if (!isAuthenticated) {
      alert('Please log in to add a post');
      return;
    }

    try {
      const { error } = await supabase.from('forum_posts').insert({
        forum_id: selectedForum.id,
        user_email: user.email,
        user_name: user.name,
        post: newPost,
      });

      if (error) throw error;
      setNewPost('');
      fetchPosts(selectedForum.id);
    } catch (error) {
      console.error('Error adding post:', error.message);
    }
  };

  return (
    <div className="forums-section">
      <h4>Forums</h4>
      <ul>
        {forums.map((forum) => (
          <li key={forum.id} onClick={() => fetchPosts(forum.id)}>
            {forum.name}
          </li>
        ))}
      </ul>
      {selectedForum && (
        <div className="forum-posts">
          <h5>Posts in {selectedForum.name}</h5>
          {selectedForum.posts.map((post) => (
            <div key={post.id} className="post">
              <p><strong>{post.user_name}</strong>: {post.post}</p>
              <small>{new Date(post.created_at).toLocaleString()}</small>
            </div>
          ))}
          {isAuthenticated && (
            <div className="add-post">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Add a post"
              ></textarea>
              <button onClick={handleAddPost}>Post</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Forums;
