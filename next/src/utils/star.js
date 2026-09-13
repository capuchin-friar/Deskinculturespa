// components/StarRating.js
import React, { useState } from 'react';
import StarRatings from 'react-star-ratings';

const StarRating = ({ rating, changeRating }) => {
    const handleRatingChange = (newRating) => {
        changeRating(newRating);
    };

    return (
        <div>
            <StarRatings
                rating={rating}
                starRatedColor="orangered"
                starEmptyColor="gray"
                numberOfStars={5}
                name='rating'
                starDimension="20px"
                starSpacing="2px"
                changeRating={handleRatingChange}
            />
        </div>
    );
};

export default StarRating;
