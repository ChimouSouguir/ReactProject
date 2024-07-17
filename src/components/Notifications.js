import React, { useState, useEffect } from 'react';
import { supabase } from '../client'; // Assurez-vous d'avoir importé votre instance de Supabase
import './Notifications.css'; // Style CSS pour les notifications

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();

    const subscription = supabase
      .from('notifications')
      .on('INSERT', (payload) => {
        console.log('New notification:', payload.new);
        setNotifications((prevNotifications) => [payload.new, ...prevNotifications]);
      })
      .subscribe();

    return () => {
      supabase.removeSubscription(subscription);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error.message);
    }
  };

  return (
    <div className="notifications-container">
      <h4>Notifications</h4>
      {notifications.map((notification) => (
        <div key={notification.id} className="notification">
          <p>{notification.message}</p>
        </div>
      ))}
    </div>
  );
}

export default Notifications;
