const StarRating = ({ rating, totalReviews }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      <div style={{ display: 'flex', gap: '2px' }}>
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} style={{ color: '#f39c12', fontSize: '16px' }}>★</span>
        ))}
        {hasHalfStar && <span style={{ color: '#f39c12', fontSize: '16px' }}>½</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} style={{ color: '#ddd', fontSize: '16px' }}>★</span>
        ))}
      </div>
      {totalReviews > 0 && (
        <span style={{ fontSize: '12px', color: '#666' }}>({totalReviews} reviews)</span>
      )}
    </div>
  );
};

export default StarRating;