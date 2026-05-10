const AboutUsPage = () => {
  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header - Full Width */}
      <div style={{
        backgroundColor: '#e67e22',
        color: 'white',
        textAlign: 'center',
        padding: '60px 20px',
        width: '100%'
      }}>
        <h1 style={{ margin: 0, fontSize: '42px' }}>About Chimango Tour</h1>
        <p style={{ margin: '16px 0 0', fontSize: '18px' }}>
          Your complete tourist and booking management system
        </p>
      </div>

      {/* What is Chimango Tour - Full Width */}
      <div style={{
        backgroundColor: 'white',
        padding: '50px 20px',
        width: '100%'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ color: '#e67e22', marginBottom: '20px', fontSize: '28px' }}>What is Chimango Tour?</h2>
          <p style={{ lineHeight: '1.8', color: '#555', fontSize: '16px' }}>
            Chimango Tour is a comprehensive tourist and booking management system designed to help travelers 
            discover, book, and manage amazing activities across Malawi. The platform connects tourists with local 
            experiences, making it easy to explore the beauty of the Warm Heart of Africa.
          </p>
        </div>
      </div>

      {/* Contact Info - Full Width */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '50px 20px',
        width: '100%',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ color: '#e67e22', marginBottom: '20px', fontSize: '28px' }}>Contact Us</h2>
          <p style={{ marginBottom: '20px', color: '#555', fontSize: '16px' }}>
            For support, questions, or feedback:
          </p>
          <p style={{ marginBottom: '10px', fontSize: '16px' }}>
            Email: <a href="mailto:goshsolution@gmail.com" style={{ color: '#e67e22', textDecoration: 'none' }}>goshsolution@gmail.com</a>
          </p>
          <p style={{ fontSize: '16px' }}>
            Phone: <a href="tel:0995718815" style={{ color: '#e67e22', textDecoration: 'none' }}>0995718815</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;