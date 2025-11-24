import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    profilePhoto: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [originalImage, setOriginalImage] = useState(null);
  const [editedImage, setEditedImage] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setUser(data);
      setFormData({
        name: data.name || '',
        email: data.email || '',
        profilePhoto: data.profilePhoto || ''
      });
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load profile');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Profile updated successfully!');
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setError(data.message || 'Failed to change password');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      setError('Failed to change password');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result);
        setEditedImage(reader.result);
        setRotation(0);
        setZoom(1);
        setCrop({ x: 0, y: 0, width: 100, height: 100 });
        setShowImageEditor(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const rotateImage = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const applyCropAndRotate = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Set canvas size for rotation
      if (rotation === 90 || rotation === 270) {
        canvas.width = img.height;
        canvas.height = img.width;
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }

      // Apply rotation
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      
      // Get rotated image
      const rotatedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      
      // Now apply crop
      const cropCanvas = document.createElement('canvas');
      const cropCtx = cropCanvas.getContext('2d');
      const cropImg = new Image();
      
      cropImg.onload = () => {
        const scaleX = cropImg.width / 100;
        const scaleY = cropImg.height / 100;
        
        const cropWidth = crop.width * scaleX * zoom;
        const cropHeight = crop.height * scaleY * zoom;
        const cropX = crop.x * scaleX;
        const cropY = crop.y * scaleY;
        
        cropCanvas.width = 300;
        cropCanvas.height = 300;
        
        cropCtx.drawImage(
          cropImg,
          cropX,
          cropY,
          cropWidth,
          cropHeight,
          0,
          0,
          300,
          300
        );
        
        const finalImage = cropCanvas.toDataURL('image/jpeg', 0.9);
        setFormData({ ...formData, profilePhoto: finalImage });
        setShowImageEditor(false);
      };
      
      cropImg.src = rotatedDataUrl;
    };
    
    img.src = originalImage;
  };

  if (!user) return <div className="loading">Loading...</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button onClick={() => navigate(-1)} className="back-btn">← Back</button>
        <h1>My Profile</h1>
      </div>

      <div className="profile-content">
        <div className="profile-sidebar">
          <div className="profile-photo-section">
            <div className="profile-photo-wrapper">
              {formData.profilePhoto ? (
                <img src={formData.profilePhoto} alt="Profile" className="profile-photo" />
              ) : (
                <div className="profile-photo-placeholder">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <label className="upload-photo-btn">
                {formData.profilePhoto ? 'Change Photo' : 'Upload Photo'}
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              </label>
              {formData.profilePhoto && (
                <button 
                  onClick={() => setFormData({ ...formData, profilePhoto: '' })}
                  className="remove-photo-btn"
                  type="button"
                >
                  Remove Photo
                </button>
              )}
            </div>
          </div>
          <div className="user-info-sidebar">
            <h3>{user.name || user.username}</h3>
            <p className="role-badge">{user.role}</p>
          </div>
        </div>

        <div className="profile-main">
          <div className="tabs">
            <button 
              className={activeTab === 'profile' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('profile')}
            >
              Profile Information
            </button>
            <button 
              className={activeTab === 'password' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('password')}
            >
              Change Password
            </button>
          </div>

          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate} className="profile-form">
              <div className="form-group">
                <label>Username</label>
                <input type="text" value={user.username} disabled className="disabled-input" />
              </div>

              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <input type="text" value={user.role} disabled className="disabled-input" />
              </div>

              <button type="submit" className="save-btn">Save Changes</button>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordChange} className="profile-form">
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="save-btn">Change Password</button>
            </form>
          )}
        </div>
      </div>

      <style jsx>{`
        .profile-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 30px;
        }

        .back-btn {
          padding: 8px 16px;
          background: #f0f0f0;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
        }

        .back-btn:hover {
          background: #e0e0e0;
        }

        .profile-content {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 30px;
        }

        .profile-sidebar {
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          text-align: center;
        }

        .profile-photo-wrapper {
          width: 150px;
          height: 150px;
          margin: 0 auto 20px;
          border-radius: 50%;
          overflow: hidden;
          border: 4px solid #4CAF50;
        }

        .profile-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .profile-photo-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 60px;
          color: white;
          font-weight: bold;
        }

        .upload-photo-btn {
          display: inline-block;
          padding: 10px 20px;
          background: #4CAF50;
          color: white;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.3s;
        }

        .upload-photo-btn:hover {
          background: #45a049;
        }

        .remove-photo-btn {
          display: inline-block;
          padding: 10px 20px;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.3s;
        }

        .remove-photo-btn:hover {
          background: #c82333;
        }

        .user-info-sidebar {
          margin-top: 20px;
        }

        .user-info-sidebar h3 {
          margin: 10px 0;
          font-size: 24px;
        }

        .role-badge {
          display: inline-block;
          padding: 6px 16px;
          background: #e3f2fd;
          color: #1976d2;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          text-transform: capitalize;
        }

        .profile-main {
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 30px;
          border-bottom: 2px solid #f0f0f0;
        }

        .tab {
          padding: 12px 24px;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          font-size: 16px;
          color: #666;
          transition: all 0.3s;
        }

        .tab.active {
          color: #4CAF50;
          border-bottom-color: #4CAF50;
        }

        .profile-form {
          max-width: 600px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #333;
        }

        .form-group input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
        }

        .disabled-input {
          background: #f5f5f5;
          cursor: not-allowed;
        }

        .save-btn {
          padding: 12px 32px;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 500;
          transition: background 0.3s;
        }

        .save-btn:hover {
          background: #45a049;
        }

        .success-message {
          padding: 12px;
          background: #d4edda;
          color: #155724;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .error-message {
          padding: 12px;
          background: #f8d7da;
          color: #721c24;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .loading {
          text-align: center;
          padding: 40px;
          font-size: 18px;
        }

        @media (max-width: 768px) {
          .profile-content {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Image Editor Modal */}
      {showImageEditor && originalImage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.9)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Edit Profile Photo</h3>
            
            {/* Image Preview */}
            <div style={{
              width: '100%',
              height: '400px',
              backgroundColor: '#f0f0f0',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <img 
                src={originalImage}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  transform: `rotate(${rotation}deg) scale(${zoom})`,
                  transition: 'transform 0.3s ease'
                }}
              />
            </div>

            {/* Controls */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Zoom: {zoom.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Crop Size: {crop.width}%
                </label>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={crop.width}
                  onChange={(e) => setCrop({ ...crop, width: parseInt(e.target.value), height: parseInt(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Horizontal Position: {crop.x}%
                </label>
                <input
                  type="range"
                  min="0"
                  max={100 - crop.width}
                  step="1"
                  value={crop.x}
                  onChange={(e) => setCrop({ ...crop, x: parseInt(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Vertical Position: {crop.y}%
                </label>
                <input
                  type="range"
                  min="0"
                  max={100 - crop.height}
                  step="1"
                  value={crop.y}
                  onChange={(e) => setCrop({ ...crop, y: parseInt(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>

              <button
                onClick={rotateImage}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500',
                  marginBottom: '10px'
                }}
              >
                🔄 Rotate 90°
              </button>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  setShowImageEditor(false);
                  setOriginalImage(null);
                  setEditedImage(null);
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={applyCropAndRotate}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                Apply & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
