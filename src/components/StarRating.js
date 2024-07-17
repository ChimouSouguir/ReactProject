import { FaStar } from 'react-icons/fa';
import React, { useState, useEffect } from "react";



export default function StarRatings({ averageRating, onRate }) {
  const totalStars = 5;
  const [selectedStars, setSelectedStars] = useState(0);

  const handleStarClick = (starIndex) => {
    setSelectedStars(starIndex);
    onRate(starIndex);
  };

  const renderStars = () => {
    const stars = [];
    const integerPart = Math.floor(averageRating);
    const decimalPart = averageRating - integerPart;
  
    // Render fully colored stars based on the integer part of averageRating
    for (let i = 0; i < integerPart; i++) {
      stars.push(
        <label key={i} className="star" onClick={() => handleStarClick(i + 1)}>
          <FaStar style={{ color: 'yellow', cursor: 'pointer' }} />
        </label>
      );
    }
  
    // Render partially colored star based on the decimal part of averageRating
    if (decimalPart > 0) {
      stars.push(
        <label key={integerPart} className="star" onClick={() => handleStarClick(integerPart + 1)}>
          <FaStar style={{ color: 'linear-gradient(to right, yellow, yellow ' + (decimalPart * 100) + '%, transparent ' + (decimalPart * 100) + '%)', cursor: 'pointer' }} />
        </label>
      );
    }
  
    // Render remaining empty stars
    for (let i = integerPart + 1; i < totalStars; i++) {
      stars.push(
        <label key={i} className="star" onClick={() => handleStarClick(i + 1)}>
          <FaStar style={{ color: 'black', cursor: 'pointer' }} />
        </label>
      );
    }
  
    return stars;
  };
  

  return (
    <div className="star-ratings">
      {renderStars()}
      <style >{`
        .star {
          transition: color 0.2s; /* Ajoutez une transition de couleur */
        }
      `}</style>
    </div>
  );
}
