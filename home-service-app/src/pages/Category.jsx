import React from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { businesses } from '../data';
import ServiceCard from '../components/ServiceCard';

const Category = () => {
  const { name } = useParams();
  const filtered = businesses.filter((b) => b.category.toLowerCase() === name.toLowerCase());

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 mt-10">
        <h2 className="text-2xl font-bold mb-4">{name} Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filtered.map((b, i) => (
            <ServiceCard key={i} service={b} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Category;
