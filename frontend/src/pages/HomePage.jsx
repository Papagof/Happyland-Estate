import estateGate from '../assets/estate-gate.jpg';

export default function HomePage({ residentCount, properties, activeExecutiveCount }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)',
      minHeight: '100vh',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #200583 50%, #d7401a 100%)',
          color: 'white',
          padding: '60px 40px',
          borderRadius: '16px',
          marginBottom: '40px',
          boxShadow: '0 10px 40px rgba(37, 99, 235, 0.25)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '40px'
        }}>
          <div style={{ flex: '1 1 320px' }}>
            <h1 style={{
              fontSize: '40px',
              fontWeight: 'bold',
              marginBottom: '15px',
              color: 'white'
            }}>
              Building More Than Homes...
            </h1>
            <p style={{
              fontSize: '24px',
              marginBottom: '20px',
              color: '#E2E8F0'
            }}>
              Creating Communities for Modern Living.
            </p>
            <p style={{
              fontSize: '16px',
              color: '#E2E8F0',
              lineHeight: '1.6'
            }}>
              Welcome to Happyland Estate - A premier residential community dedicated to providing a safe, comfortable, and thriving environment for all our residents and property owners. Our estate is designed with modern amenities and a strong sense of community.
            </p>
          </div>
          <img
            src={estateGate}
            alt="Happyland Estate entrance gate"
            style={{
              flex: '1 1 320px',
              maxWidth: '480px',
              width: '100%',
              height: '300px',
              objectFit: 'cover',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.3)'
            }}
          />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          {[
            { count: residentCount, label: 'Residents & Landlords', color: '#b91010' },
            { count: properties.filter(p => p.available).length, label: 'Available Properties', color: '#2563EB' },
            { count: activeExecutiveCount, label: 'Active Management', color: '#b81414' }
          ].map((stat, idx) => (
            <div key={idx} style={{
              background: 'white',
              padding: '30px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)',
              border: `4px solid ${stat.color}`
            }}>
              <div style={{
                fontSize: '40px',
                fontWeight: 'bold',
                color: stat.color,
                marginBottom: '10px'
              }}>
                {stat.count}
              </div>
              <div style={{
                fontSize: '16px',
                color: '#64748B'
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1E3A8A',
            marginBottom: '20px'
          }}>
            Estate Features
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            {[
              '24/7 Security & CCTV Monitoring',
              'Well-Maintained Roads & Infrastructure',
              'Recreational Facilities',
              'Regular Maintenance & Cleaning',
              'Efficient Estate Management',
              'Community Events & Activities'
            ].map((feature, idx) => (
              <div key={idx} style={{
                padding: '15px',
                background: '#F8FAFC',
                borderRadius: '8px',
                color: '#1E293B',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  background: '#14B8A6',
                  borderRadius: '50%'
                }} />
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
