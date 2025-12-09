export const mockUserData = {
    name: "أحمد عبدالله",
    nationalId: "1********23",
    overallScore: 64,
    initialStatus: "يحتاج انتباه",
    updatedScore: 98,
    updatedStatus: "ممتاز",
    categories: [
        {
            id: "documents",
            name: "الوثائق الشخصية",
            icon: "FileText",
            score: 95,
            status: "excellent",
            statusText: "ممتاز",
            items: [
                {
                    name: "الهوية الوطنية",
                    status: "سارية",
                    expiryDate: "15 يونيو 2027",
                    daysUntilExpiry: 950,
                    statusEmoji: "✅"
                },
                {
                    name: "رخصة القيادة",
                    status: "سارية",
                    expiryDate: "3 يناير 2030",
                    daysUntilExpiry: 1850,
                    statusEmoji: "✅"
                }
            ]
        },
        {
            id: "vehicles",
            name: "المركبات والنقل",
            icon: "Car",
            score: 58,
            status: "warning",
            statusText: "يحتاج انتباه",
            items: [
                {
                    name: "استمارة السيارة",
                    plate: "ااا ١١١",
                    status: "تنتهي قريباً",
                    expiryDate: "15 يناير 2025",
                    daysUntilExpiry: 32,
                    cost: 300,
                    statusEmoji: "⚠️"
                }
            ]
        },
        {
            id: "workers",
            name: "العمالة المنزلية",
            icon: "Users",
            score: 12,
            status: "critical",
            statusText: "عاجل",
            updatedScore: 100,
            updatedStatusText: "ممتاز",
            items: [
                {
                    name: "أحمد شاه",
                    nationality: "بنغلاديش",
                    iqamaNumber: "2*******89",
                    issues: [
                        {
                            type: "iqama_expiry",
                            severity: "critical",
                            message: "الإقامة تنتهي خلال 5 أيام",
                            icon: "❌",
                            expiryDate: "15 ديسمبر 2024",
                            cost: 650
                        },
                        {
                            type: "insurance",
                            severity: "critical",
                            message: "التأمين الطبي منتهي",
                            icon: "❌",
                            expiredDays: 12,
                            cost: 800
                        },
                        {
                            type: "contract",
                            severity: "warning",
                            message: "العقد يحتاج تجديد",
                            icon: "⚠️",
                            cost: 0
                        }
                    ],
                    totalCost: 1450
                }
            ]
        },
        {
            id: "family",
            name: "أفراد العائلة",
            icon: "Users",
            score: 100,
            status: "excellent",
            statusText: "ممتاز",
            items: [
                {
                    name: "سارة محمد (الزوجة)",
                    status: "الوثائق سارية",
                    statusEmoji: "✅"
                },
                {
                    name: "عمر أحمد (الابن، 12 سنة)",
                    status: "الوثائق سارية",
                    statusEmoji: "✅"
                }
            ]
        },
        {
            id: "financial",
            name: "الالتزامات المالية",
            icon: "DollarSign",
            score: 100,
            status: "excellent",
            statusText: "ممتاز",
            items: [
                {
                    name: "المخالفات المرورية",
                    count: 0,
                    amount: 0,
                    status: "لا توجد مخالفات",
                    statusEmoji: "✅"
                }
            ]
        }
    ],
    fixingSteps: [
        {
            step: 1,
            text: "البحث عن خيارات التأمين...",
            duration: 800
        },
        {
            step: 2,
            text: "اختيار تأمين التعاونية (800 ريال - أفضل سعر)",
            duration: 600
        },
        {
            step: 3,
            text: "تجديد التأمين الطبي... تم ✓",
            duration: 1000
        },
        {
            step: 4,
            text: "تحديث عقد مساند... تم ✓",
            duration: 1000
        },
        {
            step: 5,
            text: "تقديم طلب تجديد الإقامة... تم ✓",
            duration: 1000
        }
    ],
    successDetails: {
        transactionId: "ABR-2024-998877",
        resolvedIssues: 3,
        newInsuranceExpiry: "ديسمبر 2025",
        newIqamaExpiry: "ديسمبر 2026"
    }
};
