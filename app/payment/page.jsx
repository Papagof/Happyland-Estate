'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { paymentsApi } from '@/lib/api-client';

export default function PaymentPage() {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (paymentData.amount && paymentData.residentName && paymentData.propertyAddress) {
      const payment = await paymentsApi.create(paymentData);
      alert(`Payment of ₦${payment.amount} recorded successfully!\n\nReference ID: ${payment.reference}`);
      setPaymentData(null);
      setShowPaymentForm(false);
    }
  };

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1E3A8A', marginBottom: '30px' }}>Service Charge Payment</h1>
        <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1E3A8A', marginBottom: '20px' }}>Make a Payment</h2>
          <div style={{ background: '#E8F4EF', padding: '15px', borderRadius: '8px', marginBottom: '20px', color: '#1E3A8A', fontSize: '14px' }}>
            <strong>Monthly Service Charge:</strong> ₦15,000 per unit
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
            {[
              { label: 'Resident Name', key: 'residentName', type: 'text' },
              { label: 'Property Address', key: 'propertyAddress', type: 'text' },
              { label: 'Amount (₦)', key: 'amount', type: 'number' }
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1E293B' }}>{label}</label>
                <input type={type} value={paymentData?.[key] || ''} onChange={(e) => setPaymentData({...paymentData, [key]: e.target.value})}
                  style={{ width: '100%', padding: '12px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
            ))}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1E293B' }}>Payment Method</label>
              <select value={paymentData?.method || 'bank_transfer'} onChange={(e) => setPaymentData({...paymentData, method: e.target.value})}
                style={{ width: '100%', padding: '12px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box' }}>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="card">Debit Card</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="cash">Cash Payment</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px', paddingTop: '15px' }}>
              <button type="submit" style={{ flex: 1, background: '#10B981', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
                Process Payment
              </button>
              <button type="button" onClick={() => { setShowPaymentForm(false); setPaymentData(null); }}
                style={{ flex: 1, background: '#94A3B8', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
        {!showPaymentForm && (
          <button onClick={() => { setShowPaymentForm(true); setPaymentData({ residentName: '', propertyAddress: '', amount: '' }); }}
            style={{ width: '100%', background: '#1E3A8A', color: 'white', padding: '15px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
            <Plus size={20} style={{ marginRight: '10px', verticalAlign: 'middle' }} /> Make New Payment
          </button>
        )}
      </div>
    </div>
  );
}
