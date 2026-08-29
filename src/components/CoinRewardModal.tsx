import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  X, 
  Sparkles, 
  TrendingUp, 
  Award, 
  BookOpen, 
  Edit3, 
  AlertCircle, 
  Flame, 
  CheckCircle2, 
  History, 
  Info, 
  Gift,
  ShoppingBag,
  Ticket,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  GraduationCap,
  Laptop,
  Book,
  Clock,
  ShieldCheck,
  ArrowRight,
  Search,
  Tag
} from 'lucide-react';
import { CoinTransaction, CoinRewardRuleCategory, RewardItem, UserRedeemedVoucher } from '../types';

interface CoinRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCredits: number;
  userId?: string;
  initialTab?: 'redeem' | 'my_vouchers' | 'rules' | 'history';
}

export const CoinRewardModal: React.FC<CoinRewardModalProps> = ({
  isOpen,
  onClose,
  currentCredits,
  userId = 'u_student',
  initialTab = 'redeem'
}) => {
  const [activeTab, setActiveTab] = useState<'redeem' | 'my_vouchers' | 'rules' | 'history'>(initialTab);
  const [loading, setLoading] = useState<boolean>(false);
  const [walletData, setWalletData] = useState<{
    credits: number;
    total_earned: number;
    transactions: CoinTransaction[];
    rules: CoinRewardRuleCategory[];
  } | null>(null);

  // Rewards catalog & my vouchers
  const [catalog, setCatalog] = useState<RewardItem[]>([]);
  const [myVouchers, setMyVouchers] = useState<UserRedeemedVoucher[]>([]);
  const [selectedRewardCategory, setSelectedRewardCategory] = useState<string>('ALL');
  const [selectedHistoryCategory, setSelectedHistoryCategory] = useState<string>('ALL');
  
  // Redeem action states
  const [selectedItemToRedeem, setSelectedItemToRedeem] = useState<RewardItem | null>(null);
  const [isRedeeming, setIsRedeeming] = useState<boolean>(false);
  const [redeemSuccessVoucher, setRedeemSuccessVoucher] = useState<any | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (initialTab) setActiveTab(initialTab);
      fetchWalletData();
      fetchCatalog();
      fetchMyVouchers();
    }
  }, [isOpen, initialTab, userId]);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/wallet/history?user_id=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setWalletData(data);
      }
    } catch (e) {
      console.error("Error fetching wallet data:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCatalog = async () => {
    try {
      const res = await fetch('/api/rewards/catalog');
      if (res.ok) {
        const data = await res.json();
        setCatalog(data.catalog || []);
      }
    } catch (e) {
      console.error("Error fetching rewards catalog:", e);
    }
  };

  const fetchMyVouchers = async () => {
    try {
      const res = await fetch(`/api/rewards/my-vouchers?user_id=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setMyVouchers(data.vouchers || []);
      }
    } catch (e) {
      console.error("Error fetching user vouchers:", e);
    }
  };

  const handleConfirmRedeem = async () => {
    if (!selectedItemToRedeem) return;
    setIsRedeeming(true);
    try {
      const res = await fetch('/api/rewards/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          reward_id: selectedItemToRedeem.id
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRedeemSuccessVoucher(data.voucher);
        // Refresh wallet and vouchers
        await fetchWalletData();
        await fetchCatalog();
        await fetchMyVouchers();
      } else {
        alert(data.message || 'Không thể đổi phần thưởng lúc này.');
      }
    } catch (e: any) {
      console.error("Error redeeming item:", e);
      alert('Lỗi kết nối khi đổi quà: ' + e.message);
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  if (!isOpen) return null;

  const displayCredits = walletData?.credits !== undefined ? walletData.credits : currentCredits;
  const displayTotalEarned = walletData?.total_earned !== undefined ? walletData.total_earned : (currentCredits + 10);
  const transactions = walletData?.transactions || [];

  const getRewardIcon = (category: string, imageTag: string) => {
    if (category === 'COURSE_DISCOUNT') return <GraduationCap className="w-5 h-5 text-indigo-600" />;
    if (category === 'BOOKSTORE_VOUCHER') return <BookOpen className="w-5 h-5 text-emerald-600" />;
    if (category === 'MOCK_TEST_EXAM') return <Laptop className="w-5 h-5 text-blue-600" />;
    return <Gift className="w-5 h-5 text-amber-500" />;
  };

  const filteredCatalog = catalog.filter(item => {
    const matchesCategory = selectedRewardCategory === 'ALL' || item.category === selectedRewardCategory;
    const matchesSearch = searchQuery.trim() === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.partner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.discount_label.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredTransactions = transactions.filter(t => {
    if (selectedHistoryCategory === 'ALL') return true;
    if (selectedHistoryCategory === 'REDEMPTION') return t.source_type === 'REDEMPTION' || t.amount < 0;
    if (selectedHistoryCategory === 'TESTS') return t.source_type.includes('TEST') || t.source_type.includes('REMEDIAL');
    if (selectedHistoryCategory === 'WRITING_SPEAKING') return t.source_type.includes('WRITING') || t.source_type.includes('SPEAKING');
    if (selectedHistoryCategory === 'VOCAB') return t.source_type.includes('VOCAB') || t.source_type.includes('QUIZIZZ');
    if (selectedHistoryCategory === 'BONUS') return t.source_type.includes('BONUS') || t.source_type.includes('STREAK');
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-amber-50/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                  Cửa Hàng Đổi Quà & Ví Xu IELTS
                </h3>
                <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-100 text-amber-900 rounded-full border border-amber-300">
                  🎁 Ưu Đãi Khóa Học & Nhà Sách
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Tích lũy Xu từ việc luyện đề để đổi voucher giảm giá khóa học, mua sách tại Fahasa, Phương Nam, Tiki...
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance Overview Banner */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200/80 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Current Balance */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md relative overflow-hidden flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-emerald-100 block">Số Xu Khả Dụng Để Đổi Quà</span>
                <div className="mt-0.5 flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black tracking-tight">{displayCredits}</span>
                  <span className="text-xs font-bold text-amber-300">Xu Thưởng</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-amber-300">
                <Coins className="w-5 h-5" />
              </div>
            </div>

            {/* Total Earned */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 block">Tổng Xu Đã Tích Lũy</span>
                <div className="mt-0.5 flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">{displayTotalEarned}</span>
                  <span className="text-xs font-bold text-slate-500">Xu</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            {/* My Vouchers Count */}
            <div 
              onClick={() => setActiveTab('my_vouchers')}
              className="p-3.5 rounded-2xl bg-white hover:bg-amber-50/50 border border-slate-200 hover:border-amber-300 shadow-xs flex items-center justify-between cursor-pointer transition-all group"
            >
              <div>
                <span className="text-[11px] font-bold text-slate-500 block">Voucher Đã Nhận</span>
                <div className="mt-0.5 flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-amber-600">{myVouchers.length}</span>
                  <span className="text-xs font-bold text-slate-600">Voucher</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Ticket className="w-5 h-5" />
              </div>
            </div>

          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 sm:gap-2 px-6 pt-2 pb-0 border-b border-slate-200 bg-white overflow-x-auto no-scrollbar shrink-0 relative z-10">
          <button
            onClick={() => setActiveTab('redeem')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'redeem'
                ? 'border-emerald-600 text-emerald-700 font-extrabold bg-emerald-50/70 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-t-xl'
            }`}
          >
            <Gift className="w-4 h-4 text-emerald-600" />
            <span>Đổi Quà & Voucher ({catalog.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('my_vouchers')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'my_vouchers'
                ? 'border-amber-500 text-amber-700 font-extrabold bg-amber-50/70 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-t-xl'
            }`}
          >
            <Ticket className="w-4 h-4 text-amber-600" />
            <span>Voucher Của Tôi {myVouchers.length > 0 && `(${myVouchers.length})`}</span>
            {myVouchers.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'rules'
                ? 'border-emerald-600 text-emerald-700 font-extrabold bg-emerald-50/70 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-t-xl'
            }`}
          >
            <Info className="w-4 h-4 text-blue-600" />
            <span>Bảng Quy Tắc Tích Xu</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-emerald-600 text-emerald-700 font-extrabold bg-emerald-50/70 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-t-xl'
            }`}
          >
            <History className="w-4 h-4 text-slate-600" />
            <span>Lịch Sử Biến Động ({transactions.length})</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* ================= TAB 1: REDEEM GIFTS & VOUCHERS ================= */}
          {activeTab === 'redeem' && (
            <div className="space-y-5">
              
              {/* Filter pills & search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar text-xs">
                  {[
                    { id: 'ALL', label: 'Tất Cả Ưu Đãi' },
                    { id: 'COURSE_DISCOUNT', label: '🎓 Khóa Học Tiếng Anh' },
                    { id: 'BOOKSTORE_VOUCHER', label: '📚 Nhà Sách & Tài Liệu' },
                    { id: 'MOCK_TEST_EXAM', label: '💻 Thi Thử & Lệ Phí Thi' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedRewardCategory(f.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                        selectedRewardCategory === f.id
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="relative min-w-[220px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm Fahasa, khóa học, sách..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50"
                  />
                </div>
              </div>

              {/* Reward Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCatalog.map((item) => {
                  const canAfford = displayCredits >= item.cost_coins;
                  const coinsNeeded = item.cost_coins - displayCredits;

                  return (
                    <div 
                      key={item.id}
                      className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all p-4.5 flex flex-col justify-between relative overflow-hidden group"
                    >
                      {/* Top ribbon / badge */}
                      {item.badge && (
                        <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-white font-extrabold text-[10px] px-3 py-0.5 rounded-bl-xl shadow-xs">
                          {item.badge}
                        </div>
                      )}

                      <div>
                        {/* Partner & Category Header */}
                        <div className="flex items-center gap-2.5 mb-2.5">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            item.category === 'COURSE_DISCOUNT' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                            item.category === 'BOOKSTORE_VOUCHER' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {getRewardIcon(item.category, item.image_tag)}
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              {item.partner_name}
                            </span>
                            <span className="inline-block font-black text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              {item.discount_label}
                            </span>
                          </div>
                        </div>

                        {/* Title */}
                        <h4 className="text-sm font-extrabold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
                          {item.title}
                        </h4>

                        {/* Description */}
                        <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-2">
                          {item.description}
                        </p>

                        {/* Value & Terms footnote */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          {item.original_value && (
                            <span>Trị giá: <strong className="text-slate-800">{item.original_value}</strong></span>
                          )}
                          <span>Còn lại: <strong className="text-slate-800">{item.stock}</strong> suất</span>
                        </div>
                      </div>

                      {/* Footer CTA & Coin Cost */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-black text-amber-600">{item.cost_coins}</span>
                          <span className="text-xs font-bold text-slate-700">Xu</span>
                        </div>

                        {canAfford ? (
                          <button
                            type="button"
                            onClick={() => setSelectedItemToRedeem(item)}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-xs hover:shadow transition-all cursor-pointer flex items-center gap-1.5 hover:scale-[1.02] active:scale-95"
                          >
                            <Gift className="w-3.5 h-3.5" />
                            <span>Đổi Quà Ngay</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200">
                              Thiếu {coinsNeeded} Xu
                            </span>
                            <button
                              type="button"
                              onClick={() => setActiveTab('rules')}
                              className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                            >
                              Cách kiếm xu &rarr;
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>

              {filteredCatalog.length === 0 && (
                <div className="py-12 text-center bg-slate-50 rounded-2xl border border-slate-200">
                  <Gift className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600">Không tìm thấy phần thưởng phù hợp với từ khóa</p>
                  <button 
                    onClick={() => { setSelectedRewardCategory('ALL'); setSearchQuery(''); }}
                    className="mt-2 text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                  >
                    Xem tất cả quà tặng &rarr;
                  </button>
                </div>
              )}

            </div>
          )}

          {/* ================= TAB 2: MY VOUCHERS ================= */}
          {activeTab === 'my_vouchers' && (
            <div className="space-y-4">
              
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Cách sử dụng Voucher đã đổi:</p>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Sao chép mã voucher và đưa cho nhân viên thu ngân tại nhà sách (Fahasa, Phương Nam...) hoặc nhập vào ô "Mã giảm giá" khi thanh toán online tại website đối tác.
                  </p>
                </div>
              </div>

              {myVouchers.length === 0 ? (
                <div className="py-16 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-300">
                  <Ticket className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h4 className="text-sm font-extrabold text-slate-700">Bạn chưa đổi voucher nào</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Hãy dùng số Xu tích lũy từ việc làm bài Reading, Listening, Writing để đổi voucher giảm giá khóa học hoặc mua sách tại nhà sách!
                  </p>
                  <button
                    onClick={() => setActiveTab('redeem')}
                    className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow-xs hover:bg-emerald-700 transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>Khám phá Cửa Hàng Quà Tặng</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myVouchers.map((v) => (
                    <div 
                      key={v.id}
                      className="p-4 rounded-2xl bg-white border border-amber-200 shadow-xs hover:shadow-md transition-all relative flex flex-col justify-between overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-bl-xl">
                        {v.status === 'ACTIVE' ? 'Đang Hoạt Động' : 'Đã Dùng'}
                      </div>

                      <div>
                        <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider block">
                          {v.partner_name}
                        </span>
                        <h4 className="text-sm font-black text-slate-900 mt-0.5">
                          {v.reward_title}
                        </h4>
                        <span className="inline-block font-extrabold text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 mt-1">
                          {v.discount_label}
                        </span>

                        {/* Code box */}
                        <div className="mt-3 p-2.5 rounded-xl bg-slate-900 text-white flex items-center justify-between gap-2">
                          <div>
                            <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Mã Voucher</span>
                            <span className="font-mono font-black text-sm tracking-wider text-amber-400">{v.voucher_code}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCopyCode(v.voucher_code)}
                            className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0"
                          >
                            {copiedCode === v.voucher_code ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Đã chép</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Sao chép</span>
                              </>
                            )}
                          </button>
                        </div>

                        <p className="text-[11px] text-slate-600 mt-2.5 leading-snug">
                          {v.instructions}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Đã đổi: {new Date(v.created_at).toLocaleDateString('vi-VN')}</span>
                        <span>Hết hạn: {new Date(v.expires_at).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* ================= TAB 3: RULES ================= */}
          {activeTab === 'rules' && (
            <div className="space-y-6">
              
              {/* Highlight rule formula card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-200/80">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">
                      Công thức Tích lũy Xu Tự động:
                    </h4>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                      <strong className="text-emerald-700">Tổng Xu Nhận Được</strong> = <span className="font-semibold text-slate-900">Xu Thưởng Lượt Làm Bài (Cố định)</span> + <span className="font-semibold text-slate-900">Xu Thưởng Điểm Số / Band Điểm Đạt Được (Hiệu suất)</span>
                    </p>
                    <div className="mt-2.5 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                        <span className="font-bold text-emerald-800">Ví dụ Reading / Listening:</span>
                        <p className="text-slate-600 text-[11px] mt-0.5">Làm bài đạt Band 7.5 = +2 xu hoàn thành + 4 xu điểm cao = <strong>+6 Xu</strong></p>
                      </div>
                      <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                        <span className="font-bold text-emerald-800">Ví dụ Writing / Speaking:</span>
                        <p className="text-slate-600 text-[11px] mt-0.5">Nộp bài được AI chấm Band 7.0 = +3 xu nộp bài + 5 xu điểm cao = <strong>+8 Xu</strong></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conversion Rule Matrix Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Reading & Listening */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-emerald-300 transition-all">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900">1. Reading & Listening</h4>
                        <span className="text-[10px] text-slate-500">Tự động chấm theo số câu đúng</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 text-[11px] font-bold bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                      2 - 7 Xu / Bài
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                      <span className="font-bold text-slate-800">Lượt làm bài hoàn tất</span>
                      <span className="font-extrabold text-emerald-600">+2 Xu cơ bản</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 px-2">
                      <span className="text-slate-600">Band 8.0 - 9.0 (≥ 35/40 câu)</span>
                      <span className="font-bold text-emerald-700">+5 Xu thưởng</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 px-2">
                      <span className="text-slate-600">Band 7.0 - 7.5 (30 - 34 câu)</span>
                      <span className="font-bold text-emerald-700">+4 Xu thưởng</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 px-2">
                      <span className="text-slate-600">Band 6.0 - 6.5 (23 - 29 câu)</span>
                      <span className="font-bold text-emerald-700">+3 Xu thưởng</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 px-2">
                      <span className="text-slate-600">Band 5.0 - 5.5 (16 - 22 câu)</span>
                      <span className="font-bold text-emerald-700">+2 Xu thưởng</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 px-2">
                      <span className="text-slate-600">Band &lt; 5.0 (&lt; 16 câu)</span>
                      <span className="font-bold text-slate-500">+1 Xu động viên</span>
                    </div>
                  </div>
                </div>

                {/* 2. Writing & Speaking */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-emerald-300 transition-all">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                        <Edit3 className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900">2. Writing & Speaking</h4>
                        <span className="text-[10px] text-slate-500">AI Examiner chấm điểm 4 tiêu chí</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 text-[11px] font-bold bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                      3 - 9 Xu / Bài
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                      <span className="font-bold text-slate-800">Lượt nộp bài / bài nói</span>
                      <span className="font-extrabold text-emerald-600">+3 Xu cơ bản</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 px-2">
                      <span className="text-slate-600">AI chấm Band 8.0+</span>
                      <span className="font-bold text-emerald-700">+6 Xu thưởng</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 px-2">
                      <span className="text-slate-600">AI chấm Band 7.0 - 7.5</span>
                      <span className="font-bold text-emerald-700">+5 Xu thưởng</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 px-2">
                      <span className="text-slate-600">AI chấm Band 6.0 - 6.5</span>
                      <span className="font-bold text-emerald-700">+3 Xu thưởng</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 px-2">
                      <span className="text-slate-600">AI chấm Band 5.0 - 5.5</span>
                      <span className="font-bold text-emerald-700">+2 Xu thưởng</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 px-2">
                      <span className="text-slate-600">Full Writing Exam (Task 1+2)</span>
                      <span className="font-bold text-emerald-800">+5 Xu gốc + thưởng</span>
                    </div>
                  </div>
                </div>

                {/* 3. Remedial & Vocab */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-emerald-300 transition-all">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900">3. Sổ Lỗi Sai & Từ Vựng</h4>
                        <span className="text-[10px] text-slate-500">Khắc phục điểm yếu & mở rộng từ vựng</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 text-[11px] font-bold bg-rose-50 text-rose-700 rounded-lg border border-rose-200">
                      1 - 5 Xu / Hoạt động
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                      <span className="font-bold text-slate-800">Làm đề từ Sổ lỗi sai</span>
                      <span className="font-extrabold text-emerald-600">+2 Xu cơ bản</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 px-2">
                      <span className="text-slate-600">Độ chính xác sửa lỗi ≥ 80%</span>
                      <span className="font-bold text-emerald-700">+3 Xu thưởng</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 px-2">
                      <span className="text-slate-600">Độ chính xác sửa lỗi 60 - 79%</span>
                      <span className="font-bold text-emerald-700">+2 Xu thưởng</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 px-2">
                      <span className="text-slate-600">Tra cứu & Lưu 1 từ vào sổ tay</span>
                      <span className="font-bold text-emerald-700">+1 Xu / từ</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 px-2">
                      <span className="text-slate-600">Luyện tập Quizizz từ vựng</span>
                      <span className="font-bold text-emerald-700">+3 Xu / bài</span>
                    </div>
                  </div>
                </div>

                {/* 4. Streak Milestones */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-amber-300 transition-all">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center">
                        <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900">4. Thưởng Chuỗi Học Tập (Streak)</h4>
                        <span className="text-[10px] text-slate-500 font-medium">Thưởng học liên tục hàng ngày & cán mốc tuần/tháng</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
                      1 - 50 Xu / Mốc
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/70 border border-emerald-100">
                      <div>
                        <span className="font-bold text-slate-800 block">Vào học & duy trì Streak mỗi ngày</span>
                        <span className="text-[10px] text-slate-500">Cộng ngay sau khi làm 1 bài luyện tập</span>
                      </div>
                      <span className="font-extrabold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200">+1 Xu / ngày</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                      <div>
                        <span className="font-semibold text-slate-800 block">Cán mốc Streak 7 Ngày liên tục</span>
                        <span className="text-[10px] text-amber-700 font-medium">Thưởng tuần chăm chỉ</span>
                      </div>
                      <span className="font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-200">+10 Xu thưởng mốc</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                      <div>
                        <span className="font-semibold text-slate-800 block">Cán mốc Streak 14 Ngày liên tục</span>
                        <span className="text-[10px] text-amber-700 font-medium">Thưởng 2 tuần kiên trì</span>
                      </div>
                      <span className="font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-200">+20 Xu thưởng mốc</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/60 border border-amber-200/60">
                      <div>
                        <span className="font-bold text-slate-900 block">Cán mốc Streak 30 Ngày liên tục</span>
                        <span className="text-[10px] text-orange-700 font-bold">Thưởng 1 tháng kỷ luật</span>
                      </div>
                      <span className="font-black text-amber-900 bg-amber-200 px-2 py-0.5 rounded-md border border-amber-300">+50 Xu thưởng mốc</span>
                    </div>
                  </div>
                </div>

                {/* 5. Monthly Leaderboard Top 3 Rewards */}
                <div className="md:col-span-2 p-4.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-50 to-orange-50/80 border-2 border-amber-300 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-amber-200/80">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center font-black">
                        <Award className="w-4 h-4 text-amber-700" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">5. Cơ Chế Thưởng Xu Bảng Xếp Hạng Top 3 Tháng</h4>
                        <span className="text-[10px] text-amber-800 font-semibold">Tự động trao thưởng vào 23:59 ngày cuối cùng mỗi tháng</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 text-[11px] font-black bg-amber-200 text-amber-950 rounded-lg border border-amber-300">
                      Tối đa +500 Xu
                    </span>
                  </div>

                  <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="bg-white/90 p-3 rounded-xl border border-amber-300">
                      <div className="font-black text-amber-800 flex items-center gap-1">
                        👑 Top 1 Quán Quân
                      </div>
                      <div className="text-base font-black text-amber-600 mt-1">+500 Xu Thưởng</div>
                      <p className="text-[10px] text-slate-600 mt-0.5 font-medium">Huy hiệu Vàng & Voucher khóa học 500K</p>
                    </div>

                    <div className="bg-white/90 p-3 rounded-xl border border-slate-300">
                      <div className="font-black text-slate-700 flex items-center gap-1">
                        🥈 Top 2 Á Quân 1
                      </div>
                      <div className="text-base font-black text-slate-700 mt-1">+300 Xu Thưởng</div>
                      <p className="text-[10px] text-slate-600 mt-0.5 font-medium">Huy hiệu Bạc & Voucher luyện đề 300K</p>
                    </div>

                    <div className="bg-white/90 p-3 rounded-xl border border-orange-300">
                      <div className="font-black text-orange-800 flex items-center gap-1">
                        🥉 Top 3 Á Quân 2
                      </div>
                      <div className="text-base font-black text-orange-600 mt-1">+200 Xu Thưởng</div>
                      <p className="text-[10px] text-slate-600 mt-0.5 font-medium">Huy hiệu Đồng & Voucher AI 200K</p>
                    </div>
                  </div>
                </div>

                {/* 6. New Student Registration Bonus */}
                <div className="md:col-span-2 p-4.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-50 to-emerald-50 border-2 border-emerald-300 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-emerald-200/80">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-200 text-emerald-900 flex items-center justify-center font-black">
                        <Gift className="w-4 h-4 text-emerald-700" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">6. Quà Tặng Đăng Ký Tài Khoản Học Viên Mới</h4>
                        <span className="text-[10px] text-emerald-800 font-semibold">Tự động cộng ngay khi hoàn tất đăng ký tài khoản</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 text-[11px] font-black bg-emerald-200 text-emerald-950 rounded-lg border border-emerald-300">
                      +50 Xu Thưởng
                    </span>
                  </div>

                  <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs bg-white/90 p-3 rounded-xl border border-emerald-200">
                    <div>
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Mở tài khoản học viên & thiết lập mục tiêu Band IELTS</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Nhận ngay 50 xu trong ví để đổi voucher khóa học, giáo trình bản quyền và trải nghiệm hệ sinh thái AI.
                      </p>
                    </div>
                    <span className="shrink-0 font-black text-base text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                      +50 Xu
                    </span>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ================= TAB 4: HISTORY ================= */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                {[
                  { id: 'ALL', label: 'Tất cả biến động' },
                  { id: 'REDEMPTION', label: '🎁 Đổi quà & Voucher' },
                  { id: 'TESTS', label: 'Reading / Listening / Sổ lỗi' },
                  { id: 'WRITING_SPEAKING', label: 'Writing & Speaking' },
                  { id: 'VOCAB', label: 'Từ vựng & Quizizz' },
                  { id: 'BONUS', label: 'Streak & Thưởng hệ thống' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedHistoryCategory(f.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedHistoryCategory === f.id
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Transaction List */}
              {loading ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  Đang tải lịch sử tích lũy Xu...
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="py-12 text-center bg-slate-50 rounded-2xl border border-slate-200">
                  <Coins className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600">Chưa có giao dịch nào trong mục này</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Hãy làm một bài thi thử hoặc nộp bài luận để nhận Xu ngay!</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredTransactions.map((tx) => {
                    const isPositive = tx.amount > 0;
                    return (
                      <div 
                        key={tx.id}
                        className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-emerald-200 transition-all flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            tx.source_type === 'REDEMPTION' || tx.amount < 0 ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                            tx.source_type.includes('TEST') ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                            tx.source_type.includes('WRITING') ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                            tx.source_type.includes('SPEAKING') ? 'bg-teal-50 text-teal-600 border border-teal-200' :
                            tx.source_type.includes('REMEDIAL') ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                            'bg-amber-50 text-amber-600 border border-amber-200'
                          }`}>
                            {tx.source_type === 'REDEMPTION' || tx.amount < 0 ? <Gift className="w-4 h-4" /> :
                             tx.source_type.includes('TEST') ? <BookOpen className="w-4 h-4" /> :
                             tx.source_type.includes('WRITING') ? <Edit3 className="w-4 h-4" /> :
                             tx.source_type.includes('SPEAKING') ? <Sparkles className="w-4 h-4" /> :
                             <Coins className="w-4 h-4" />}
                          </div>

                          <div>
                            <p className="text-xs font-bold text-slate-900 leading-snug">
                              {tx.reason}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {new Date(tx.created_at).toLocaleString('vi-VN', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              {tx.base_amount !== undefined && tx.bonus_amount !== undefined && tx.bonus_amount > 0 && (
                                <span className="text-emerald-600 font-semibold">
                                  (+{tx.base_amount} gốc + {tx.bonus_amount} thưởng điểm)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`text-sm font-black flex items-center justify-end gap-1 ${
                            isPositive ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {isPositive ? `+${tx.amount}` : tx.amount} Xu
                          </span>
                          {tx.balance_after !== undefined && (
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              Số dư: {tx.balance_after} Xu
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Voucher đối tác được đảm bảo giá trị quy đổi chính thức</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>

      {/* Confirmation Modal to Redeem */}
      {selectedItemToRedeem && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-slate-900 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                <Gift className="w-5 h-5" />
              </div>
              <button 
                onClick={() => setSelectedItemToRedeem(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Xác nhận đổi quà</span>
              <h3 className="text-base font-black text-slate-900 mt-1">{selectedItemToRedeem.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{selectedItemToRedeem.partner_name}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-700">
                <span>Số Xu sẽ dùng:</span>
                <span className="font-extrabold text-amber-600 text-sm">-{selectedItemToRedeem.cost_coins} Xu</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span>Số dư hiện tại:</span>
                <span className="font-bold">{displayCredits} Xu</span>
              </div>
              <div className="flex items-center justify-between text-slate-700 pt-1.5 border-t border-emerald-200/60 font-bold">
                <span>Số dư sau khi đổi:</span>
                <span className="text-emerald-700">{displayCredits - selectedItemToRedeem.cost_coins} Xu</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Mã voucher sẽ có hiệu lực trong 90 ngày và hiển thị ngay tại mục <strong>"Voucher Của Tôi"</strong>.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedItemToRedeem(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isRedeeming}
                onClick={handleConfirmRedeem}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs shadow-md hover:from-emerald-700 hover:to-teal-700 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isRedeeming ? 'Đang xử lý...' : 'Xác Nhận Đổi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal with Code */}
      {redeemSuccessVoucher && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in zoom-in-95 duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-emerald-200 text-slate-900 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-black text-emerald-700 uppercase tracking-wider">Đổi Quà Thành Công! 🎉</span>
              <h3 className="text-base font-black text-slate-900 mt-1">{redeemSuccessVoucher.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{redeemSuccessVoucher.partner_name}</p>
            </div>

            {/* Voucher code box */}
            <div className="p-4 rounded-2xl bg-slate-950 text-white space-y-2 text-center relative">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Mã Ưu Đãi Của Bạn</span>
              <div className="font-mono font-black text-xl tracking-wider text-amber-400">
                {redeemSuccessVoucher.code}
              </div>

              <button
                type="button"
                onClick={() => handleCopyCode(redeemSuccessVoucher.code)}
                className="mt-1 px-4 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-extrabold inline-flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copiedCode === redeemSuccessVoucher.code ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Đã Sao Chép Mã</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao Chép Mã</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-600 text-left bg-slate-50 p-3 rounded-xl border border-slate-200">
              {redeemSuccessVoucher.instructions}
            </p>

            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRedeemSuccessVoucher(null);
                  setSelectedItemToRedeem(null);
                  setActiveTab('my_vouchers');
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
              >
                Xem Trong "Voucher Của Tôi" &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
