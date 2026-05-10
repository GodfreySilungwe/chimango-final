import { Link } from 'react-router-dom';

const TestPayment = () => {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>Payment Page Test</h1>
      <p>If you see this, navigation to /payment is working!</p>
      <Link to="/activities">Back to Activities</Link>
    </div>
  );
};

export default TestPayment;