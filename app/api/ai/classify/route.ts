import { NextResponse } from "next/server"
import type { LegalCategory, CourtLevel, LawyerType } from "@/lib/database.types"

interface ClassificationRequest {
  userMessage: string
  conversationHistory?: Array<{ role: "user" | "ai"; content: string }>
}

interface ClassificationResponse {
  category: LegalCategory
  courtLevel: CourtLevel
  requiredLawyerType: LawyerType
  followUpQuestions: string[]
  explanation: string
}

/**
 * AI Legal Case Classification API
 * Classifies legal cases according to Algerian judicial hierarchy
 * 
 * DISCLAIMER: This AI does NOT provide legal advice.
 * It only classifies and interprets case descriptions to help connect clients with appropriate lawyers.
 */

// Keywords for legal category classification
const categoryKeywords: Record<LegalCategory, string[]> = {
  criminal: [
    "crime",
    "جريمة",
    "جنحة",
    "arrest",
    "اعتقال",
    "police",
    "شرطة",
    "theft",
    "سرقة",
    "assault",
    "اعتداء",
    "murder",
    "قتل",
    "fraud",
    "احتيال",
    "drugs",
    "مخدرات",
  ],
  family: [
    "divorce",
    "طلاق",
    "custody",
    "حضانة",
    "marriage",
    "زواج",
    "child",
    "طفل",
    "أطفال",
    "alimony",
    "نفقة",
    "inheritance",
    "ميراث",
    "وراثة",
  ],
  civil: [
    "contract",
    "عقد",
    "property",
    "ملكية",
    "عقار",
    "dispute",
    "نزاع",
    "injury",
    "إصابة",
    "damage",
    "ضرر",
    "neighbor",
    "جار",
    "debt",
    "دين",
  ],
  commercial: [
    "business",
    "تجارة",
    "company",
    "شركة",
    "trade",
    "تجاري",
    "commercial",
    "corporation",
    "مؤسسة",
    "bankruptcy",
    "إفلاس",
    "partnership",
    "شراكة",
  ],
  administrative: [
    "government",
    "حكومة",
    "permit",
    "رخصة",
    "تصريح",
    "license",
    "administrative",
    "إداري",
    "public",
    "عام",
    "ministry",
    "وزارة",
    "municipality",
    "بلدية",
  ],
  labor: [
    "work",
    "عمل",
    "job",
    "وظيفة",
    "employee",
    "موظف",
    "عامل",
    "salary",
    "راتب",
    "أجر",
    "fired",
    "termination",
    "فصل",
    "طرد",
    "workplace",
    "مكان العمل",
  ],
  immigration: [
    "visa",
    "تأشيرة",
    "passport",
    "جواز سفر",
    "immigration",
    "هجرة",
    "residency",
    "إقامة",
    "citizenship",
    "جنسية",
    "deportation",
    "ترحيل",
  ],
}

// Keywords for court level detection
const courtLevelKeywords = {
  appeal: [
    "appeal",
    "استئناف",
    "appellate",
    "محكمة الاستئناف",
    "court of appeal",
    "second instance",
    "الدرجة الثانية",
  ],
  supreme_court: [
    "supreme court",
    "المحكمة العليا",
    "cour suprême",
    "cassation",
    "نقض",
    "final judgment",
    "حكم نهائي",
    "highest court",
    "المحكمة الأعلى",
  ],
  council_of_state: [
    "council of state",
    "مجلس الدولة",
    "conseil d'état",
    "administrative court",
    "المحكمة الإدارية",
    "government dispute",
    "نزاع إداري",
    "public administration",
    "الإدارة العامة",
  ],
}

function classifyCategory(text: string): LegalCategory {
  const lowerText = text.toLowerCase()
  let maxScore = 0
  let detectedCategory: LegalCategory = "civil"

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    const score = keywords.filter((keyword) => lowerText.includes(keyword.toLowerCase())).length
    if (score > maxScore) {
      maxScore = score
      detectedCategory = category as LegalCategory
    }
  }

  return detectedCategory
}

function detectCourtLevel(text: string): CourtLevel {
  const lowerText = text.toLowerCase()

  // Check for supreme court
  const supremeScore = courtLevelKeywords.supreme_court.filter((keyword) =>
    lowerText.includes(keyword.toLowerCase()),
  ).length
  if (supremeScore > 0) {
    return "supreme_court"
  }

  // Check for council of state
  const councilScore = courtLevelKeywords.council_of_state.filter((keyword) =>
    lowerText.includes(keyword.toLowerCase()),
  ).length
  if (councilScore > 0) {
    return "council_of_state"
  }

  // Check for appeal
  const appealScore = courtLevelKeywords.appeal.filter((keyword) => lowerText.includes(keyword.toLowerCase())).length
  if (appealScore > 0) {
    return "appeal"
  }

  // Default to first instance
  return "first_instance"
}

function determineRequiredLawyerType(courtLevel: CourtLevel, category: LegalCategory): LawyerType {
  // Administrative cases always require Council of State lawyers at higher levels
  if (category === "administrative" && courtLevel === "council_of_state") {
    return "council_of_state"
  }

  // Map court level to lawyer type
  switch (courtLevel) {
    case "supreme_court":
      return "supreme_court"
    case "council_of_state":
      return "council_of_state"
    case "appeal":
      return "appeal"
    case "first_instance":
    default:
      return "regular"
  }
}

function generateFollowUpQuestions(
  category: LegalCategory,
  courtLevel: CourtLevel,
  text: string,
): string[] {
  const questions: string[] = []

  // If court level is unclear, ask for clarification
  if (courtLevel === "first_instance" && text.length < 50) {
    questions.push("Is this a new case, or are you appealing a previous decision?")
    questions.push("هل هذه قضية جديدة، أم أنك تستأنف حكمًا سابقًا؟")
  }

  // Category-specific questions
  switch (category) {
    case "criminal":
      if (!text.toLowerCase().includes("charge")) {
        questions.push("Have you been formally charged with any crime?")
        questions.push("هل تم توجيه اتهام رسمي لك؟")
      }
      break
    case "family":
      if (!text.toLowerCase().includes("child")) {
        questions.push("Are there children involved in this matter?")
        questions.push("هل هناك أطفال معنيون بهذا الأمر؟")
      }
      break
    case "administrative":
      questions.push("Is this dispute with a government agency or public body?")
      questions.push("هل النزاع مع هيئة حكومية أو جهة عامة؟")
      break
    case "labor":
      questions.push("Are you currently employed or have you been terminated?")
      questions.push("هل أنت موظف حاليًا أم تم فصلك؟")
      break
  }

  // Court level specific questions
  if (courtLevel === "appeal" || courtLevel === "supreme_court") {
    questions.push("Do you have a copy of the previous court judgment?")
    questions.push("هل لديك نسخة من الحكم السابق؟")
  }

  return questions.slice(0, 3) // Limit to 3 questions
}

function generateExplanation(category: LegalCategory, courtLevel: CourtLevel, lawyerType: LawyerType): string {
  const categoryNames: Record<LegalCategory, string> = {
    criminal: "Criminal Law / القانون الجنائي",
    family: "Family Law / قانون الأسرة",
    civil: "Civil Law / القانون المدني",
    commercial: "Commercial Law / القانون التجاري",
    administrative: "Administrative Law / القانون الإداري",
    labor: "Labor Law / قانون العمل",
    immigration: "Immigration Law / قانون الهجرة",
  }

  const courtNames: Record<CourtLevel, string> = {
    first_instance: "First Instance Court / المحكمة الابتدائية",
    appeal: "Court of Appeal / محكمة الاستئناف",
    supreme_court: "Supreme Court / المحكمة العليا",
    council_of_state: "Council of State / مجلس الدولة",
  }

  const lawyerNames: Record<LawyerType, string> = {
    regular: "lawyers authorized for first instance courts",
    appeal: "lawyers authorized for appellate courts",
    supreme_court: "lawyers authorized for Supreme Court",
    council_of_state: "lawyers authorized for Council of State",
  }

  return `Based on your description, this appears to be a **${categoryNames[category]}** matter that may require proceedings at the **${courtNames[courtLevel]}**. You will need to consult with ${lawyerNames[lawyerType]}.

**Important:** This is only a preliminary classification to help you find the right legal professional. A qualified lawyer will provide a detailed assessment of your case.`
}

export async function POST(request: Request) {
  try {
    const body: ClassificationRequest = await request.json()
    const { userMessage } = body

    if (!userMessage || userMessage.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Classify the legal issue
    const category = classifyCategory(userMessage)
    const courtLevel = detectCourtLevel(userMessage)
    const requiredLawyerType = determineRequiredLawyerType(courtLevel, category)
    const followUpQuestions = generateFollowUpQuestions(category, courtLevel, userMessage)
    const explanation = generateExplanation(category, courtLevel, requiredLawyerType)

    const response: ClassificationResponse = {
      category,
      courtLevel,
      requiredLawyerType,
      followUpQuestions,
      explanation,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("[AI Classify] Error:", error)
    return NextResponse.json({ error: "Failed to classify case" }, { status: 500 })
  }
}
