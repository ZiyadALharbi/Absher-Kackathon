'use client';

import { useState, useEffect } from 'react';
import { Wallet, Plus, ArrowDownToLine, Eye, EyeOff } from 'lucide-react';

export default function WalletCard() {
  const [balance, setBalance] = useState(0);
  const [showBalance, setShowBalance] = useState(true);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('');

  useEffect(() => {
    // Load balance from localStorage with default 1000 SAR for demo
    if (typeof window !== 'undefined') {
      const savedBalance = localStorage.getItem('wallet_balance');
      if (savedBalance) {
        setBalance(parseFloat(savedBalance));
      } else {
        // Default balance: 5000 SAR for demo/testing
        setBalance(5000);
        localStorage.setItem('wallet_balance', '5000');
      }

      // Listen for wallet updates (e.g., after payment)
      const handleWalletUpdate = () => {
        const updatedBalance = localStorage.getItem('wallet_balance');
        if (updatedBalance) {
          setBalance(parseFloat(updatedBalance));
        }
      };

      window.addEventListener('walletUpdate', handleWalletUpdate);
      
      return () => {
        window.removeEventListener('walletUpdate', handleWalletUpdate);
      };
    }
  }, []);

  const handleRecharge = () => {
    const amount = parseFloat(rechargeAmount);
    if (amount > 0) {
      const newBalance = balance + amount;
      setBalance(newBalance);
      localStorage.setItem('wallet_balance', newBalance.toString());
      setRechargeAmount('');
      setShowRechargeModal(false);
    }
  };

  const quickRechargeAmounts = [100, 250, 500, 1000];

  return (
    <>
      {/* Compact Wallet Card */}
      <div className="relative group">
        <div className="bg-gradient-to-br from-[#00663D] to-[#004A2C] rounded-xl px-4 py-2.5 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-white/20">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            
            {/* Balance */}
            <div className="flex-1 min-w-0">
              <p className="text-white/70 text-xs leading-tight">المحفظة</p>
              {showBalance ? (
                <p className="text-white font-bold text-lg leading-tight">
                  {balance.toFixed(0)} <span className="text-xs font-normal">ر.س</span>
                </p>
              ) : (
                <div className="flex items-center gap-0.5">
                  <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowRechargeModal(true)}
                className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                title="شحن المحفظة"
              >
                <Plus className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                title={showBalance ? 'إخفاء الرصيد' : 'إظهار الرصيد'}
              >
                {showBalance ? (
                  <Eye className="w-4 h-4 text-white" />
                ) : (
                  <EyeOff className="w-4 h-4 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recharge Modal */}
      {showRechargeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 transform transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#00663D] to-[#004A2C] text-white p-6 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">شحن المحفظة</h3>
                  <p className="text-white/80 text-sm">أضف رصيد إلى محفظتك</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Current Balance */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">الرصيد الحالي</p>
                <p className="text-2xl font-bold text-[#00663D]">{balance.toFixed(2)} ريال</p>
              </div>

              {/* Quick Amounts */}
              <div className="mb-4">
                <p className="text-sm font-bold text-gray-700 mb-3">مبالغ سريعة</p>
                <div className="grid grid-cols-4 gap-2">
                  {quickRechargeAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setRechargeAmount(amount.toString())}
                      className={`py-3 rounded-lg border-2 transition-all font-bold ${
                        rechargeAmount === amount.toString()
                          ? 'border-[#00663D] bg-[#00663D]/10 text-[#00663D]'
                          : 'border-gray-200 hover:border-[#00663D] text-gray-600'
                      }`}
                    >
                      {amount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  أو أدخل مبلغ مخصص
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={rechargeAmount}
                    onChange={(e) => setRechargeAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-[#00663D] focus:border-transparent"
                  />
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                    ريال
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRechargeModal(false)}
                  className="flex-1 py-3 border-2 border-gray-200 rounded-lg text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleRecharge}
                  disabled={!rechargeAmount || parseFloat(rechargeAmount) <= 0}
                  className="flex-1 py-3 bg-gradient-to-r from-[#00663D] to-[#004A2C] text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  شحن الآن
                </button>
              </div>

              {/* Note */}
              <p className="text-xs text-gray-500 text-center mt-4">
                💡 يمكنك استخدام الرصيد لدفع المخالفات والرسوم الحكومية
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

