import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import violationsData from '@/data/violations.json';
import documentsData from '@/data/documents.json';
import vehiclesData from '@/data/vehicles.json';
import servicesData from '@/data/services.json';
import serviceRequirements from '@/data/service_requirements.json';
import aboutAbsher from '@/data/about_absher.json';

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json();

    const GROQ_API_KEY = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;
    
    if (!GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY not configured. Please add it to .env.local' },
        { status: 500 }
      );
    }

    const groq = new Groq({
      apiKey: GROQ_API_KEY,
    });

    // Smart retrieval: Find relevant services based on user query
    const findRelevantServices = (query: string) => {
      const queryLower = query.toLowerCase();
      const keywords = {
        'رخصة': ['renew_driving_license'],
        'قياد': ['renew_driving_license'],
        'هوية': ['national_id_renewal', 'national_id_replacement_lost', 'national_id_replacement_damaged', 'national_id_issue_family_member'],
        'مخالف': ['traffic_violation_objection', 'traffic_violations_comprehensive_inquiry', 'traffic_violation_payment_extension', 'traffic_violation_payment'],
        'حادث': ['traffic_accident_report', 'traffic_accident_objection_or_waiver'],
        'اعتراض': ['traffic_violation_objection', 'traffic_accident_objection_or_waiver'],
        'تجديد': ['renew_driving_license', 'national_id_renewal'],
        'سداد': ['traffic_violation_payment'],
        'تقرير': ['traffic_accident_report'],
      };
      
      const relevantCodes = new Set<string>();
      for (const [key, codes] of Object.entries(keywords)) {
        if (queryLower.includes(key)) {
          codes.forEach(code => relevantCodes.add(code));
        }
      }
      
      // If no specific keywords, return top 3 most common services
      if (relevantCodes.size === 0) {
        return serviceRequirements.services.slice(0, 3);
      }
      
      return serviceRequirements.services.filter(s => relevantCodes.has(s.code));
    };

    const relevantServices = findRelevantServices(message);

    // Build context with ONLY relevant services (much smaller!)
    const context = `أنت عون، المساعد الذكي للخدمات الحكومية في المملكة العربية السعودية.

📖 معلومات عن منصة أبشر:
${JSON.stringify(aboutAbsher, null, 2)}

📚 قاعدة المعرفة - الخدمات ذات الصلة:
${JSON.stringify(relevantServices, null, 2)}

بيانات المستخدم الحالية:
${JSON.stringify({
  violations: violationsData,
  documents: documentsData,
  vehicles: vehiclesData,
}, null, 2)}

مهمتك:
1. **إذا سأل عن منصة أبشر**: استخدم بيانات "معلومات عن منصة أبشر" أعلاه لإعطاء إجابة واضحة وشاملة
   
2. **عند السؤال عن خدمة**: استخدم بيانات "قاعدة المعرفة" أعلاه لإعطاء إجابة دقيقة عن:
   - المتطلبات (requirements)
   - الخطوات (steps)
   - الرسوم (payment/fee)
   - الملاحظات (notes)
   
3. إذا سأل عن المخالفات، اعرض له مخالفاته من بيانات المستخدم
4. كن ودوداً ومحترفاً وواضحاً ومختصراً
5. رد باللغة العربية دائماً
6. إذا أراد سداد مخالفة، أخبره أن الخدمة متاحة عبر المحفظة

تذكر: أنت تتحدث مع مواطن سعودي، كن محترماً ومفيداً ودقيقاً.`;

    // Build messages array
    const messages = [
      {
        role: 'system',
        content: context,
      },
      ...(conversationHistory || []),
      {
        role: 'user',
        content: message,
      },
    ];

    // Call Groq API - using faster, lighter model with reduced tokens
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 500, // Reduced to fit within limits
    });

    const response = completion.choices[0]?.message?.content || 'عذراً، لم أتمكن من معالجة طلبك.';

    // Check if response mentions violations
    let data = null;
    if (message.includes('مخالف') || message.includes('غرام') || response.includes('مخالفة')) {
      const pendingViolations = violationsData.filter(v => v.status === 'pending');
      if (pendingViolations.length > 0) {
        data = pendingViolations;
      }
    }

    return NextResponse.json({
      response,
      data,
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

