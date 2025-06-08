// src/components/ProviderCategoryCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProviderCategoryCard = ({ category }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/provider/category/${category.name}`)}
      className="flex flex-col items-center bg-purple-50 p-4 rounded-md hover:bg-purple-100 transition cursor-pointer"
    >
      <span className="text-3xl">{category.icon}</span>
      <p className="mt-2 font-semibold text-purple-700">{category.name}</p>
    </div>
  );
};

export default ProviderCategoryCard;
