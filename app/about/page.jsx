export default function AboutPage() {
  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1E3A8A', marginBottom: '30px' }}>
          About Happyland Estate
        </h1>
        <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)', lineHeight: '1.8', color: '#1E293B' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1E3A8A', marginBottom: '20px' }}>Welcome to Happyland Estate</h2>
          <p style={{ marginBottom: '20px' }}>
            Happyland Estate is a premier residential community located at Oko-Ado along the Lekki-Epe Expressway in Lagos, Nigeria. Established with a vision to provide affordable yet quality living spaces, we have grown to become one of the most sought-after residential addresses in the Lekki axis.
          </p>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1E3A8A', marginTop: '30px', marginBottom: '15px' }}>Our Vision</h3>
          <p style={{ marginBottom: '20px' }}>
            To create a vibrant, secure, and sustainable residential community where families can thrive, and property owners can enjoy excellent returns on their investments.
          </p>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1E3A8A', marginTop: '30px', marginBottom: '15px' }}>Our Mission</h3>
          <p style={{ marginBottom: '20px' }}>
            To provide world-class estate management services, maintain high standards of security and infrastructure, and foster a strong sense of community among all residents and stakeholders.
          </p>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1E3A8A', marginTop: '30px', marginBottom: '15px' }}>Estate Amenities</h3>
          <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
            {[
              'Modern residential buildings with contemporary architecture',
              '24/7 security and surveillance system',
              'Well-maintained paved roads and street lighting',
              'Water supply and waste management systems',
              'Recreational facilities including green spaces',
              'Community center for social gatherings',
              'Reliable power supply infrastructure',
              'School proximity and educational facilities'
            ].map((amenity, idx) => (
              <li key={idx} style={{ marginBottom: '10px' }}>{amenity}</li>
            ))}
          </ul>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1E3A8A', marginTop: '30px', marginBottom: '15px' }}>Location & Accessibility</h3>
          <p style={{ marginBottom: '20px' }}>
            Situated at Oko-Ado on the Lekki-Epe Expressway, Happyland Estate enjoys excellent accessibility to major business districts, shopping centers, restaurants, and educational institutions.
          </p>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1E3A8A', marginTop: '30px', marginBottom: '15px' }}>Community Living</h3>
          <p>
            At Happyland Estate, we believe in building more than just houses - we build communities. Regular community events, neighborhood associations, and active engagement in estate development ensure that every resident is part of a thriving, supportive environment.
          </p>
        </div>
      </div>
    </div>
  );
}
