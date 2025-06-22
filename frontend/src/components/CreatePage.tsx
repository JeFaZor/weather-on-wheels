import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './CreatePage.css';
import { createPlace } from '../services/api';

const CreatePage = () => {
  const [name, setName] = useState('');
  const [type, setType] = useState('Restaurant');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !address) {
      alert('Please fill all required fields');
      return;
    }

    if (name.length > 25) {
      alert('Name cannot be longer than 25 characters');
      return;
    }

    setLoading(true);

    try {
      await createPlace({ name, type, address });
      alert('Place saved successfully!');
      setName('');
      setAddress('');
      setType('Restaurant');
      navigate('/');
    } catch (error) {
      alert('Error saving place');
    } finally {
      setLoading(false);
    }
};

  return (
    <div className="create-page">
      <h1>Add New Place</h1>
      
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Place Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={25}
              placeholder="Enter place name"
              required
            />
            <small>{name.length}/25 characters</small>
          </div>

          <div className="field">
            <label>Place Type:</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="Restaurant">Restaurant</option>
              <option value="Hotel">Hotel</option>
              <option value="Park">Park</option>
            </select>
          </div>

          <div className="field">
            <label>Address:</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter address"
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Place'}
          </button>
        </form>

        <div className="back-link">
          <Link to="/" className="back-button">
            ← Back to Places List
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;