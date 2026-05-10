import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#2c3e50',
      color: '#ecf0f1',
      padding: '30px 20px',
      marginTop: 'auto',
      width: '100%'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>
            Designed by <strong style={{ color: '#e67e22' }}>Gosh Solutions</strong>
          </p>
          <p style={{ margin: '5px 0', fontSize: '12px', color: '#bdc3c7' }}>
            Email: <a href="mailto:goshsolution@gmail.com" style={{ color: '#e67e22', textDecoration: 'none' }}>goshsolution@gmail.com</a>
          </p>
          <p style={{ margin: '5px 0', fontSize: '12px', color: '#bdc3c7' }}>
            Phone: <a href="tel:0995718815" style={{ color: '#e67e22', textDecoration: 'none' }}>0995718815</a>
          </p>
        </div>
        
        <div style={{ textAlign: 'center', flex: 1 }}>
          <Link to="/about" style={{ color: '#e67e22', textDecoration: 'none', fontSize: '12px' }}>About Us</Link>
          <span style={{ margin: '0 10px', color: '#bdc3c7' }}>|</span>
          <Link to="/contact" style={{ color: '#e67e22', textDecoration: 'none', fontSize: '12px' }}>Contact</Link>
          <p style={{ margin: '10px 0 5px', fontSize: '12px', color: '#bdc3c7' }}>
            © {new Date().getFullYear()} Chimango Tour. All rights reserved.
          </p>
          <p style={{ margin: '5px 0', fontSize: '12px', color: '#bdc3c7' }}>
            Discover the beauty of Malawi
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;