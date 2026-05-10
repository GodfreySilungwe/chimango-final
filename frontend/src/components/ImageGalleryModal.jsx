import { useState } from 'react';

const ImageGalleryModal = ({ activity, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!activity) return null;

  const allImages = activity.images || [];
  const mainImage = activity.mainImage;
  
  // Combine main image with other images, avoid duplicates
  const galleryImages = mainImage && !allImages.includes(mainImage) 
    ? [mainImage, ...allImages] 
    : allImages;

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      animation: 'fadeIn 0.3s ease'
    }} onClick={onClose}>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes zoomIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
        `}
      </style>
      
      <div style={{
        maxWidth: '90vw',
        maxHeight: '90vh',
        position: 'relative',
        animation: 'zoomIn 0.3s ease'
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Main Image */}
        <img
          src={galleryImages[selectedImage]}
          alt={activity.name}
          style={{
            maxWidth: '90vw',
            maxHeight: '80vh',
            objectFit: 'contain',
            borderRadius: '8px'
          }}
        />

        {/* Image Counter */}
        <div style={{
          position: 'absolute',
          bottom: '-40px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0,0,0,0.6)',
          color: 'white',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '14px'
        }}>
          {selectedImage + 1} / {galleryImages.length}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '-40px',
            right: '-40px',
            backgroundColor: 'rgba(0,0,0,0.6)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            fontSize: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ✕
        </button>

        {/* Previous Arrow */}
        {galleryImages.length > 1 && (
          <button
            onClick={prevImage}
            style={{
              position: 'absolute',
              left: '-50px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0,0,0,0.6)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ❮
          </button>
        )}

        {/* Next Arrow */}
        {galleryImages.length > 1 && (
          <button
            onClick={nextImage}
            style={{
              position: 'absolute',
              right: '-50px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0,0,0,0.6)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ❯
          </button>
        )}

        {/* Thumbnails */}
        {galleryImages.length > 1 && (
          <div style={{
            position: 'absolute',
            bottom: '-80px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '8px',
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: '8px',
            borderRadius: '8px',
            maxWidth: '80vw',
            overflowX: 'auto'
          }}>
            {galleryImages.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedImage(idx)}
                style={{
                  width: '60px',
                  height: '60px',
                  border: idx === selectedImage ? '3px solid #e67e22' : '2px solid transparent',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGalleryModal;