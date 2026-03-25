import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ProfileUpload = () => {
  const { API_URL, user, updateUserProfile } = useAuth();
  const [profilePicture, setProfilePicture] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    // Load current profile picture
    if (user?.profilePicture) {
      setProfilePicture(`http://localhost:5000${user.profilePicture}`);
    }
  }, [user]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setMessage({
          type: 'error',
          text: 'Please select a valid image file (JPEG, PNG, or GIF)'
        });
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({
          type: 'error',
          text: 'File size must be less than 5MB'
        });
        return;
      }

      setSelectedFile(file);
      setMessage({ type: '', text: '' });

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage({
        type: 'error',
        text: 'Please select a file first'
      });
      return;
    }

    setUploading(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData();
    formData.append('profilePicture', selectedFile);

    try {
      const response = await axios.post(
        `${API_URL}/user/upload-profile-picture`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setMessage({
        type: 'success',
        text: 'Profile picture uploaded successfully!'
      });

      setProfilePicture(`http://localhost:5000${response.data.profilePicture}`);
      setSelectedFile(null);
      setPreview(null);

      // Update user profile in context
      await updateUserProfile();

    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to upload profile picture'
      });
    }

    setUploading(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your profile picture?')) {
      return;
    }

    setUploading(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.delete(`${API_URL}/user/delete-profile-picture`);

      setMessage({
        type: 'success',
        text: 'Profile picture deleted successfully!'
      });

      setProfilePicture(null);

      // Update user profile in context
      await updateUserProfile();

    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to delete profile picture'
      });
    }

    setUploading(false);
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreview(null);
    setMessage({ type: '', text: '' });
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '30px',
      background: 'white',
      borderRadius: '15px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      marginBottom: '30px'
    }}>
      <h4 style={{ marginBottom: '20px', color: '#333' }}>Profile Picture</h4>

      <div style={{
        position: 'relative',
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        overflow: 'hidden',
        border: '4px solid #667eea',
        marginBottom: '20px',
        background: '#f0f0f0'
      }}>
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : profilePicture ? (
          <img
            src={profilePicture}
            alt="Profile"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            color: '#999'
          }}>
            👤
          </div>
        )}
      </div>

      {message.text && (
        <div className={`message ${message.type}`} style={{ marginBottom: '15px', width: '100%', maxWidth: '400px' }}>
          {message.text}
        </div>
      )}

      {!preview && (
        <div style={{ display: 'flex', gap: '10px' }}>
          <label
            htmlFor="profile-upload"
            style={{
              padding: '10px 20px',
              background: '#667eea',
              color: 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'background 0.3s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#5568d3'}
            onMouseLeave={(e) => e.target.style.background = '#667eea'}
          >
            Choose Photo
          </label>
          <input
            id="profile-upload"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            disabled={uploading}
          />

          {profilePicture && (
            <button
              onClick={handleDelete}
              disabled={uploading}
              style={{
                padding: '10px 20px',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'background 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#c82333'}
              onMouseLeave={(e) => e.target.style.background = '#dc3545'}
            >
              Delete Photo
            </button>
          )}
        </div>
      )}

      {preview && (
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="btn btn-primary"
            style={{ padding: '10px 20px' }}
          >
            {uploading ? 'Uploading...' : 'Upload Photo'}
          </button>
          <button
            onClick={handleCancel}
            disabled={uploading}
            className="btn btn-secondary"
            style={{ padding: '10px 20px' }}
          >
            Cancel
          </button>
        </div>
      )}

      <p style={{
        marginTop: '15px',
        fontSize: '12px',
        color: '#666',
        textAlign: 'center'
      }}>
        Supported formats: JPEG, PNG, GIF<br />
        Maximum size: 5MB
      </p>
    </div>
  );
};

export default ProfileUpload;