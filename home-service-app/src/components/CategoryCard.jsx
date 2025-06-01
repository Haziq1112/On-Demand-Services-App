import React from 'react';
import { Link } from 'react-router-dom';

const CategoryCard = ({ category }) => {
  return (
    <Link to={`/category/${category.name}`}>
      <div className="flex flex-col items-center bg-purple-50 p-4 rounded-md hover:bg-purple-100 transition cursor-pointer">
        <span className="text-3xl">{category.icon}</span>
        <p className="mt-2 font-semibold text-purple-700">{category.name}</p>
      </div>
    </Link>
  );
};

export default CategoryCard;
