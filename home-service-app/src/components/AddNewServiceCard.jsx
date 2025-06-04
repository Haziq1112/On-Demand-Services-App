// src/components/AddNewServiceCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/solid';

const AddNewServiceCard = () => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate('/provider/services/add')}
      className="flex flex-col items-center justify-center bg-white border-2 border-dashed border-purple-500 rounded-md h-full min-h-[300px] cursor-pointer hover:bg-purple-50 transition"
    >
      <PlusIcon className="w-12 h-12 text-purple-500" />
      <p className="mt-2 text-purple-600 font-semibold">Add New Service</p>
    </div>
  );
};

export default AddNewServiceCard;
