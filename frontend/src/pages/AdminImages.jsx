import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const AdminImages = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState('');
  const [selectedActivityData, setSelectedActivityData] = useState(null);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchActivities();
    }
  }, [user]);

  const fetchActivities = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/activities`);
      setActivities(res.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const handleActivitySelect = async (activityId) => {
    setSelectedActivity(activityId);
    const activity = activities.find(a => a._id === activityId);
    setSelectedActivityData(activity);
    setImages([]);
    setMessage('');
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    try {
      const res = await axios.post(`${API_URL}/api/upload-multiple`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setImages(prev => [...prev, ...res.data.images]);
      setMessage(`${files.length} image(s) uploaded successfully!`);
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const saveImagesToActivity = async () => {
  if (!selectedActivity) {
    setMessage('Please select an activity');
    return;
  }

  if (images.length === 0) {
    setMessage('Please upload images first');
    return;
  }

  try {
    const activity = activities.find(a => a._id === selectedActivity);
    // REPLACE all images instead of adding (clear old ones)
    const updatedImages = [...images];
    
    await axios.put(`${API_URL}/api/activities/${selectedActivity}`, {
      ...activity,
      images: updatedImages,
      mainImage: updatedImages[0]
    });

    setMessage('Images replaced successfully!');
    setImages([]);
    fetchActivities();
    handleActivitySelect(selectedActivity);
  } catch (error) {
    console.error('Save error:', error);
    setMessage('Failed to save images');
  }
};
  const deleteExistingImage = async (imageUrl, index) => {
  if (!confirm('Are you sure you want to delete this image?')) return;
  
  setDeleting(true);
  
  try {
    // Extract filename from URL
    const parts = imageUrl.split('/uploads/');
    const filename = parts[parts.length - 1];
    
    console.log('Deleting file:', filename);
    console.log('Image URL:', imageUrl);
    
    // Delete from uploads folder
    await axios.delete(`${API_URL}/api/upload/${filename}`);
    
    // Remove from activity images array
    const updatedImages = selectedActivityData.images.filter((_, i) => i !== index);
    const newMainImage = updatedImages.length > 0 ? updatedImages[0] : '';
    
    // Update activity
    await axios.put(`${API_URL}/api/activities/${selectedActivity}`, {
      ...selectedActivityData,
      images: updatedImages,
      mainImage: newMainImage
    });
    
    setMessage('Image deleted successfully!');
    fetchActivities();
    handleActivitySelect(selectedActivity);
    
  } catch (error) {
    console.error('Delete error details:', error);
    setMessage('Failed to delete image: ' + (error.response?.data?.message || error.message));
  } finally {
    setDeleting(false);
  }
};

  const setAsMainImage = async (imageUrl) => {
    try {
      await axios.put(`${API_URL}/api/activities/${selectedActivity}`, {
        ...selectedActivityData,
        mainImage: imageUrl
      });
      
      setMessage('Main image updated!');
      fetchActivities();
      handleActivitySelect(selectedActivity);
    } catch (error) {
      console.error('Error:', error);
      setMessage('Failed to update main image');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>Admin access required</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '32px 16px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ color: '#2c3e50', marginBottom: '8px' }}>Image Management</h1>
        <p style={{ color: '#666', marginBottom: '32px' }}>Add, delete, or change images for Malawi activities</p>

        {message && (
          <div style={{
            backgroundColor: '#d4edda',
            color: '#155724',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            {message}
          </div>
        )}

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
          <h3>1. Select Activity</h3>
          <select
            value={selectedActivity}
            onChange={(e) => handleActivitySelect(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              marginTop: '10px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px'
            }}
          >
            <option value="">-- Select an activity --</option>
            {activities.map(activity => (
              <option key={activity._id} value={activity._id}>
                {activity.name} - {activity.location}
              </option>
            ))}
          </select>
        </div>

        {selectedActivityData && selectedActivityData.images && selectedActivityData.images.length > 0 && (
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
            <h3>Current Images ({selectedActivityData.images.length})</h3>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
              Click "Set as Main" to make an image the cover photo. Click "Delete" to remove an image.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
              {selectedActivityData.images.map((img, index) => (
                <div key={index} style={{ 
                  border: selectedActivityData.mainImage === img ? '3px solid #e67e22' : '1px solid #ddd', 
                  borderRadius: '8px', 
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <img src={img} alt={`Activity ${index}`} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                  <div style={{ padding: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {selectedActivityData.mainImage !== img && (
                      <button 
                        onClick={() => setAsMainImage(img)} 
                        style={{ 
                          fontSize: '11px', 
                          padding: '4px 8px', 
                          backgroundColor: '#e67e22', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '4px', 
                          cursor: 'pointer',
                          flex: 1
                        }}
                      >
                        Set as Main
                      </button>
                    )}
                    <button 
                      onClick={() => deleteExistingImage(img, index)} 
                      style={{ 
                        fontSize: '11px', 
                        padding: '4px 8px', 
                        backgroundColor: '#e74c3c', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        cursor: 'pointer',
                        flex: 1
                      }}
                      disabled={deleting}
                    >
                      Delete
                    </button>
                  </div>
                  {selectedActivityData.mainImage === img && (
                    <div style={{ 
                      position: 'absolute', 
                      top: '5px', 
                      right: '5px', 
                      backgroundColor: '#e67e22', 
                      color: 'white', 
                      padding: '2px 6px', 
                      borderRadius: '4px', 
                      fontSize: '10px' 
                    }}>
                      Main
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
          <h3>2. Add New Images</h3>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
            Upload real photos of the activity location (JPG, PNG, GIF - max 5MB each)
          </p>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            disabled={uploading}
            style={{ marginBottom: '16px' }}
          />
          {uploading && <p>Uploading...</p>}
        </div>

        {images.length > 0 && (
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
            <h3>New Images to Add ({images.length})</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px', marginTop: '16px' }}>
              {images.map((img, index) => (
                <div key={index} style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                  <img src={img} alt={`Upload ${index}`} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
            <button
              onClick={saveImagesToActivity}
              disabled={uploading}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                backgroundColor: '#2ecc71',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Save New Images to Activity
            </button>
          </div>
        )}

        <div style={{ backgroundColor: '#e8f4fd', padding: '20px', borderRadius: '12px' }}>
          <h3>How to Replace Images:</h3>
          <ol style={{ margin: '10px 0 0 20px', lineHeight: '1.6' }}>
            <li>Select an activity from the dropdown</li>
            <li>To delete old images: Click the <strong>Delete</strong> button under any existing image</li>
            <li>To change cover photo: Click <strong>Set as Main</strong> on the image you want as cover</li>
            <li>To add new images: Upload your original pictures and click <strong>Save New Images</strong></li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AdminImages;