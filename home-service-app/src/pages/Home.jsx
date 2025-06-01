import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { services, businesses } from '../data';
import CategoryCard from '../components/CategoryCard';
import ServiceCard from '../components/ServiceCard';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  const uniqueLocations = [...new Set(businesses.map(b => b.location))];

  const filteredBusinesses = businesses.filter(
    (b) =>
      (b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (locationFilter === '' || b.location === locationFilter)
  );

  const clearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
  };

  return (
    <div>
      <Navbar />
      <div className="text-center mt-10">
        <h1 className="text-4xl font-bold">
          Find Home <span className="text-purple-600">Service/Repair</span> Near You
        </h1>
        <p className="mt-4 text-gray-600">Explore Best Home Service & Repair near you</p>

        {/* Search Bar */}
        <div className="flex justify-center mt-6">
          <input
            type="text"
            placeholder="Search services"
            className="w-1/2 p-2 border rounded-l-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="bg-purple-600 text-white px-4 py-2 rounded-r-md">🔍</button>
        </div>

        {/* Location Dropdown */}
        {/* <div className="mt-4 flex justify-center gap-4">
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="p-2 border rounded-md"
          >
            <option value="">All Locations</option>
            {uniqueLocations.map((loc, i) => (
              <option key={i} value={loc}>
                {loc}
              </option>
            ))}
          </select>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Clear Filters
          </button>
        </div> */}
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-10">
        {/* Categories */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {services.map((service, i) => (
            <CategoryCard key={i} category={service} />
          ))}
        </div>

        {/* Filtered Business List */}
        <h2 className="text-2xl font-bold mt-10 mb-4">Popular Business</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredBusinesses.length > 0 ? (
            filteredBusinesses.map((b, i) => <ServiceCard key={i} service={b} />)
          ) : (
            <p className="text-gray-600 col-span-3 text-center">No businesses found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
