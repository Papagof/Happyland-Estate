'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { paymentsApi } from '@/frontend/lib/api-client';
import Card from '@/frontend/components/ui/Card';
import Button from '@/frontend/components/ui/Button';
import Input from '@/frontend/components/ui/Input';
import Select from '@/frontend/components/ui/Select';
import { labelClass } from '@/frontend/components/ui/fieldStyles';

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
    <div className="px-5 py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Service Charge Payment</h1>

        {showPaymentForm && (
          <Card className="mt-8 animate-fade-in-up">
            <h2 className="mb-5 text-lg font-bold text-slate-900 dark:text-white">Make a Payment</h2>
            <div className="mb-5 rounded-lg bg-teal-50 px-4 py-3 text-sm text-teal-900 dark:bg-teal-500/10 dark:text-teal-300">
              <strong>Monthly Service Charge:</strong> ₦15,000 per unit
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4">
              {[
                { label: 'Resident Name', key: 'residentName', type: 'text' },
                { label: 'Property Address', key: 'propertyAddress', type: 'text' },
                { label: 'Amount (₦)', key: 'amount', type: 'number' }
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className={labelClass}>{label}</label>
                  <Input
                    type={type}
                    value={paymentData?.[key] || ''}
                    onChange={(e) => setPaymentData({ ...paymentData, [key]: e.target.value })}
                  />
                </div>
              ))}
              <div>
                <label className={labelClass}>Payment Method</label>
                <Select value={paymentData?.method || 'bank_transfer'} onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })}>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="card">Debit Card</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="cash">Cash Payment</option>
                </Select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" variant="success" className="flex-1">
                  Process Payment
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setShowPaymentForm(false);
                    setPaymentData(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {!showPaymentForm && (
          <Button
            className="mt-8 w-full py-4 text-base"
            onClick={() => {
              setShowPaymentForm(true);
              setPaymentData({ residentName: '', propertyAddress: '', amount: '' });
            }}
          >
            <Plus size={20} /> Make New Payment
          </Button>
        )}
      </div>
    </div>
  );
}
