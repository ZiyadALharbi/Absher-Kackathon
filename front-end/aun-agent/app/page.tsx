'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText,
    Car,
    Users,
    DollarSign,
    Search,
    Check,
    AlertCircle,
    Loader2,
    Sparkles,
    ArrowRight
} from 'lucide-react';
import { mockUserData } from '@/lib/mockData';

type Screen = 'landing' | 'scanning' | 'dashboard' | 'fixing' | 'success';

const iconMap: { [key: string]: any } = {
    FileText,
    Car,
    Users,
    DollarSign,
};

export default function Page() {
    const [screen, setScreen] = useState<Screen>('landing');
    const [scanProgress, setScanProgress] = useState(0);
    const [currentScanStep, setCurrentScanStep] = useState(0);
    const [displayScore, setDisplayScore] = useState(0);
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [fixingStep, setFixingStep] = useState(0);
    const [isFixed, setIsFixed] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const scanSteps = [
        "فحص الوثائق...",
        "فحص المخالفات...",
        "فحص المركبات...",
        "فحص العمالة...",
        "تحليل البيانات...",
    ];

    // Start scan animation
    const startScan = () => {
        setScreen('scanning');
        setScanProgress(0);
        setCurrentScanStep(0);

        // Animate through steps
        const stepInterval = setInterval(() => {
            setCurrentScanStep((prev) => {
                if (prev < scanSteps.length - 1) {
                    return prev + 1;
                }
                clearInterval(stepInterval);
                return prev;
            });
        }, 500);

        // Progress bar
        const progressInterval = setInterval(() => {
            setScanProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    setTimeout(() => setScreen('dashboard'), 300);
                    return 100;
                }
                return prev + 4;
            });
        }, 50);
    };

    // Animate score count-up
    useEffect(() => {
        if (screen === 'dashboard' && displayScore < mockUserData.overallScore) {
            const timer = setTimeout(() => {
                setDisplayScore((prev) => Math.min(prev + 1, isFixed ? mockUserData.updatedScore : mockUserData.overallScore));
            }, 20);
            return () => clearTimeout(timer);
        }
    }, [screen, displayScore, isFixed]);

    // Handle fixing flow
    const startFixing = () => {
        setScreen('fixing');
        setFixingStep(0);

        mockUserData.fixingSteps.forEach((step, index) => {
            setTimeout(() => {
                setFixingStep(index + 1);
                if (index === mockUserData.fixingSteps.length - 1) {
                    setTimeout(() => {
                        setScreen('success');
                    }, 1000);
                }
            }, mockUserData.fixingSteps.slice(0, index + 1).reduce((acc, s) => acc + s.duration, 0));
        });
    };

    // Return to dashboard after success
    const returnToDashboard = () => {
        setIsFixed(true);
        setDisplayScore(0);
        setScreen('dashboard');
        setExpandedCategory(null);
        setTimeout(() => setShowToast(true), 500);
        setTimeout(() => setShowToast(false), 3500);
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-absher-success';
        if (score >= 60) return 'text-absher-warning';
        return 'text-absher-critical';
    };

    const getScoreBgColor = (score: number) => {
        if (score >= 80) return 'bg-absher-success/10';
        if (score >= 60) return 'bg-absher-warning/10';
        return 'bg-absher-critical/10';
    };

    const getScoreBorderColor = (score: number) => {
        if (score >= 80) return 'border-absher-success';
        if (score >= 60) return 'border-absher-warning';
        return 'border-absher-critical';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-absher-primary via-emerald-700 to-teal-800 flex items-center justify-center p-4">
            <AnimatePresence mode="wait">
                {/* LANDING PAGE */}
                {screen === 'landing' && (
                    <motion.div
                        key="landing"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-center max-w-2xl"
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="mb-8"
                        >
                            <Sparkles className="w-20 h-20 text-yellow-300 mx-auto mb-6" />
                            <h1 className="text-6xl font-bold text-white mb-4">
                                عون - الوكيل الذكي
                            </h1>
                            <p className="text-2xl text-emerald-100 mb-12">
                                افحص حالتك الحكومية بضغطة زر واحدة
                            </p>
                        </motion.div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={startScan}
                            className="bg-white text-absher-primary px-12 py-6 rounded-2xl text-2xl font-bold shadow-2xl hover:shadow-white/20 transition-all flex items-center gap-3 mx-auto"
                        >
                            <Search className="w-8 h-8" />
                            ابدأ الفحص الشامل
                        </motion.button>
                    </motion.div>
                )}

                {/* SCANNING ANIMATION */}
                {screen === 'scanning' && (
                    <motion.div
                        key="scanning"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center max-w-xl w-full"
                    >
                        <div className="bg-white rounded-3xl shadow-2xl p-12">
                            <Loader2 className="w-16 h-16 text-absher-primary animate-spin mx-auto mb-8" />
                            <h2 className="text-3xl font-bold text-gray-800 mb-8">
                                جاري الفحص...
                            </h2>

                            <div className="space-y-4 mb-8">
                                {scanSteps.map((step, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{
                                            opacity: index <= currentScanStep ? 1 : 0.3,
                                            x: 0,
                                        }}
                                        className="flex items-center gap-3 text-right"
                                    >
                                        {index < currentScanStep ? (
                                            <Check className="w-6 h-6 text-absher-success" />
                                        ) : index === currentScanStep ? (
                                            <Loader2 className="w-6 h-6 text-absher-primary animate-spin" />
                                        ) : (
                                            <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                                        )}
                                        <span className="text-lg text-gray-700">{step}</span>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-absher-primary to-emerald-500"
                                    initial={{ width: '0%' }}
                                    animate={{ width: `${scanProgress}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                            <p className="text-gray-500 mt-3 text-lg">٪{scanProgress}</p>
                        </div>
                    </motion.div>
                )}

                {/* DASHBOARD */}
                {screen === 'dashboard' && (
                    <motion.div
                        key="dashboard"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="max-w-5xl w-full"
                    >
                        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
                            {/* Header */}
                            <div className="text-center mb-10">
                                <h2 className="text-4xl font-bold text-gray-800 mb-2">
                                    نتيجة الفحص الشامل
                                </h2>
                                <p className="text-gray-500 text-lg">
                                    مرحباً، {mockUserData.name}
                                </p>
                                <p className="text-gray-400 text-sm">آخر فحص: الآن</p>
                            </div>

                            {/* Score Circle */}
                            <div className="flex justify-center mb-12">
                                <div className={`relative ${getScoreBgColor(isFixed ? mockUserData.updatedScore : mockUserData.overallScore)} rounded-full p-8`}>
                                    <div className={`w-48 h-48 rounded-full border-8 ${getScoreBorderColor(isFixed ? mockUserData.updatedScore : mockUserData.overallScore)} flex flex-col items-center justify-center`}>
                                        <span className={`text-6xl font-bold ${getScoreColor(isFixed ? mockUserData.updatedScore : mockUserData.overallScore)}`}>
                                            {displayScore}
                                        </span>
                                        <span className="text-3xl text-gray-400 font-light">/100</span>
                                        <span className={`text-sm font-semibold mt-2 px-4 py-1 rounded-full ${isFixed ? 'bg-absher-success text-white' : displayScore >= 80 ? 'bg-absher-success text-white' : displayScore >= 60 ? 'bg-absher-warning text-white' : 'bg-absher-critical text-white'}`}>
                                            {isFixed ? mockUserData.updatedStatus : mockUserData.initialStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Categories */}
                            <div className="space-y-4">
                                {mockUserData.categories.map((category) => {
                                    const Icon = iconMap[category.icon];
                                    const isExpanded = expandedCategory === category.id;
                                    const currentScore = isFixed && category.id === 'workers' ? category.updatedScore : category.score;

                                    return (
                                        <motion.div
                                            key={category.id}
                                            layout
                                            className={`border-2 rounded-2xl overflow-hidden transition-all cursor-pointer ${currentScore! >= 80
                                                    ? 'border-absher-success bg-absher-success/5'
                                                    : currentScore! >= 60
                                                        ? 'border-absher-warning bg-absher-warning/5'
                                                        : 'border-absher-critical bg-absher-critical/5'
                                                } ${isExpanded ? 'shadow-lg' : 'hover:shadow-md'}`}
                                            onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                                        >
                                            <div className="p-6 flex items-center justify-between">
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${currentScore! >= 80
                                                            ? 'bg-absher-success text-white'
                                                            : currentScore! >= 60
                                                                ? 'bg-absher-warning text-white'
                                                                : 'bg-absher-critical text-white'
                                                        }`}>
                                                        <Icon className="w-6 h-6" />
                                                    </div>
                                                    <div className="flex-1 text-right">
                                                        <h3 className="text-xl font-semibold text-gray-800">
                                                            {category.name}
                                                        </h3>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-3xl font-bold ${getScoreColor(currentScore!)}`}>
                                                        {currentScore}/100
                                                    </span>
                                                    <span className="text-2xl">
                                                        {currentScore! >= 80 ? '✅' : currentScore! >= 60 ? '⚠️' : '❌'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Expanded Details for Workers */}
                                            {isExpanded && category.id === 'workers' && !isFixed && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="border-t-2 border-absher-critical/20 p-6 bg-white"
                                                >
                                                    {category.items.map((worker: any, idx) => (
                                                        <div key={idx} className="space-y-4">
                                                            <div className="bg-gray-50 rounded-xl p-5">
                                                                <h4 className="text-lg font-bold text-gray-800 mb-2">
                                                                    👷 العامل: {worker.name}
                                                                </h4>
                                                                <p className="text-gray-600">الجنسية: {worker.nationality}</p>
                                                                <p className="text-gray-600">رقم الإقامة: {worker.iqamaNumber}</p>
                                                            </div>

                                                            <div className="space-y-3">
                                                                <h5 className="text-lg font-semibold text-gray-800">المشاكل:</h5>
                                                                {worker.issues.map((issue: any, issueIdx: number) => (
                                                                    <div
                                                                        key={issueIdx}
                                                                        className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl"
                                                                    >
                                                                        <span className="text-xl">{issue.icon}</span>
                                                                        <p className="text-gray-700 flex-1 text-right">{issue.message}</p>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            <div className="bg-gray-100 rounded-xl p-5">
                                                                <p className="text-xl font-bold text-gray-800">
                                                                    التكلفة المتوقعة: {worker.totalCost.toLocaleString('ar-SA')} ريال
                                                                </p>
                                                            </div>

                                                            <motion.button
                                                                whileHover={{ scale: 1.02 }}
                                                                whileTap={{ scale: 0.98 }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    startFixing();
                                                                }}
                                                                className="w-full bg-gradient-to-r from-absher-primary to-emerald-600 text-white px-8 py-5 rounded-2xl text-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                                                            >
                                                                <span className="text-2xl">🚀</span>
                                                                إصلاح كل شيء بضغطة واحدة
                                                            </motion.button>
                                                        </div>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Back to landing */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    setScreen('landing');
                                    setDisplayScore(0);
                                    setIsFixed(false);
                                    setExpandedCategory(null);
                                }}
                                className="mt-8 w-full bg-gray-100 text-gray-700 px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-gray-200 transition-all"
                            >
                                فحص جديد
                            </motion.button>
                        </div>

                        {/* Toast Notification */}
                        <AnimatePresence>
                            {showToast && (
                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 50 }}
                                    className="fixed bottom-8 right-8 bg-absher-success text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3"
                                >
                                    <Check className="w-6 h-6" />
                                    <span className="text-lg font-semibold">
                                        تم حل {mockUserData.successDetails.resolvedIssues} مشاكل بنجاح ✓
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* FIXING ANIMATION */}
                {screen === 'fixing' && (
                    <motion.div
                        key="fixing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center max-w-xl w-full"
                    >
                        <div className="bg-white rounded-3xl shadow-2xl p-12">
                            <Loader2 className="w-16 h-16 text-absher-primary animate-spin mx-auto mb-8" />
                            <h2 className="text-3xl font-bold text-gray-800 mb-8">
                                جاري إصلاح المشاكل...
                            </h2>

                            <div className="space-y-4">
                                {mockUserData.fixingSteps.map((step, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{
                                            opacity: index < fixingStep ? 1 : 0.3,
                                            x: 0,
                                        }}
                                        className="flex items-start gap-3 text-right"
                                    >
                                        {index < fixingStep ? (
                                            <Check className="w-6 h-6 text-absher-success flex-shrink-0 mt-1" />
                                        ) : index === fixingStep - 1 ? (
                                            <Loader2 className="w-6 h-6 text-absher-primary animate-spin flex-shrink-0 mt-1" />
                                        ) : (
                                            <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0 mt-1" />
                                        )}
                                        <span className="text-lg text-gray-700 flex-1">{step.text}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* SUCCESS SCREEN */}
                {screen === 'success' && (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="text-center max-w-2xl w-full"
                    >
                        <div className="bg-white rounded-3xl shadow-2xl p-12">
                            {/* Success Animation */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                className="mb-8"
                            >
                                <div className="w-32 h-32 bg-absher-success rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <Check className="w-16 h-16 text-white" />
                                </div>
                                <h2 className="text-5xl font-bold text-gray-800 mb-4">
                                    تم بنجاح! ✅
                                </h2>
                            </motion.div>

                            {/* Score Update */}
                            <div className="mb-8">
                                <div className="flex items-center justify-center gap-4 text-4xl font-bold">
                                    <span className="text-absher-critical">64</span>
                                    <ArrowRight className="w-8 h-8 text-gray-400" />
                                    <span className="text-absher-success">98</span>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-4 mb-8 bg-gray-50 rounded-2xl p-6">
                                <div className="text-right">
                                    <p className="text-gray-600">رقم المعاملة:</p>
                                    <p className="text-xl font-bold text-gray-800">
                                        {mockUserData.successDetails.transactionId}
                                    </p>
                                </div>
                                <div className="border-t border-gray-200 my-4"></div>
                                <div className="text-right">
                                    <p className="text-absher-success font-semibold text-lg mb-2">
                                        ✅ تم حل جميع المشاكل
                                    </p>
                                    <p className="text-gray-700">
                                        التأمين ساري حتى: {mockUserData.successDetails.newInsuranceExpiry}
                                    </p>
                                    <p className="text-gray-700">
                                        الإقامة سارية حتى: {mockUserData.successDetails.newIqamaExpiry}
                                    </p>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={returnToDashboard}
                                className="w-full bg-gradient-to-r from-absher-primary to-emerald-600 text-white px-8 py-5 rounded-2xl text-xl font-bold shadow-lg hover:shadow-xl transition-all"
                            >
                                العودة للوحة التحكم
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
