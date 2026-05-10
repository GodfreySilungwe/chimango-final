import { useState, useEffect, useCallback } from 'react';

const HeroCarousel = ({ images, onImageClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const nextSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating, images.length]);

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const goToSlide = (index) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  const handleImageClick = () => {
    if (onImageClick && images[currentIndex]) {
      onImageClick(images[currentIndex]);
    }
  };

  const handleButtonClick = (e, image) => {
    e.stopPropagation();
    if (onImageClick) {
      onImageClick(image);
    }
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: 'clamp(200px, 35vw, 350px)',  // Smaller height
      backgroundColor: '#1a1a2e',
      overflow: 'hidden'
    }}>
      <div style={{
        display: 'flex',
        transition: 'transform 0.5s ease-in-out',
        transform: `translateX(-${currentIndex * 100}%)`,
        height: '100%'
      }}>
        {images.map((image, index) => (
          <div
            key={index}
            onClick={() => handleImageClick()}
            style={{
              minWidth: '100%',
              height: '100%',
              position: 'relative',
              cursor: 'pointer',
              overflow: 'hidden',
              backgroundColor: '#1a1a2e'
            }}
          >
            <img
              src={image.url}
              alt={image.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 30%'  // Focus on upper part of image
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
              color: 'white',
              padding: 'clamp(10px, 3vw, 20px) clamp(15px, 4vw, 25px)',
              textAlign: 'center'
            }}>
              <h2 style={{ 
                margin: 0, 
                fontSize: 'clamp(14px, 4vw, 22px)',
                textShadow: '1px 1px 2px black'
              }}>
                {image.title}
              </h2>
              <p style={{ 
                margin: '3px 0 0', 
                fontSize: 'clamp(10px, 3vw, 14px)',
                textShadow: '1px 1px 2px black',
                display: 'block'
              }}>
                {image.description}
              </p>
              <button 
                onClick={(e) => handleButtonClick(e, image)}
                style={{
                  marginTop: 'clamp(5px, 2vw, 10px)',
                  padding: 'clamp(4px, 1.5vw, 8px) clamp(12px, 3vw, 20px)',
                  backgroundColor: '#e67e22',
                  color: 'white',
                  border: 'none',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  fontSize: 'clamp(10px, 2.5vw, 13px)',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  minHeight: '32px'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#d35400'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#e67e22'}
              >
                Book Now →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        style={{
          position: 'absolute',
          left: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          backgroundColor: 'rgba(0,0,0,0.4)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: 'clamp(25px, 4vw, 32px)',
          height: 'clamp(25px, 4vw, 32px)',
          fontSize: 'clamp(14px, 3vw, 18px)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          transition: 'all 0.3s ease',
          opacity: 0.6
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
        onMouseLeave={(e) => e.currentTarget.style.opacity = 0.6}
      >
        ❮
      </button>

      <button
        onClick={nextSlide}
        style={{
          position: 'absolute',
          right: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          backgroundColor: 'rgba(0,0,0,0.4)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: 'clamp(25px, 4vw, 32px)',
          height: 'clamp(25px, 4vw, 32px)',
          fontSize: 'clamp(14px, 3vw, 18px)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          transition: 'all 0.3s ease',
          opacity: 0.6
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
        onMouseLeave={(e) => e.currentTarget.style.opacity = 0.6}
      >
        ❯
      </button>

      {/* Dots Indicator */}
      <div style={{
        position: 'absolute',
        bottom: 'clamp(8px, 2vw, 12px)',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 'clamp(5px, 2vw, 8px)',
        zIndex: 10
      }}>
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            style={{
              width: 'clamp(6px, 2vw, 8px)',
              height: 'clamp(6px, 2vw, 8px)',
              borderRadius: '50%',
              backgroundColor: currentIndex === index ? '#e67e22' : 'rgba(255,255,255,0.5)',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              minHeight: 'auto',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;