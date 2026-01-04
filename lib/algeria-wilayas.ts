/**
 * Algeria Wilayas (58 Official Administrative Divisions)
 * 
 * This is the single source of truth for all location data in Avoca.
 * Used for lawyer profiles, search filters, and legal insights.
 */

export interface Wilaya {
  code: string
  slug: string
  name_en: string
  name_ar: string
}

export const ALGERIA_WILAYAS: readonly Wilaya[] = [
  { code: "01", slug: "adrar", name_en: "Adrar", name_ar: "أدرار" },
  { code: "02", slug: "chlef", name_en: "Chlef", name_ar: "الشلف" },
  { code: "03", slug: "laghouat", name_en: "Laghouat", name_ar: "الأغواط" },
  { code: "04", slug: "oum-el-bouaghi", name_en: "Oum El Bouaghi", name_ar: "أم البواقي" },
  { code: "05", slug: "batna", name_en: "Batna", name_ar: "باتنة" },
  { code: "06", slug: "bejaia", name_en: "Béjaïa", name_ar: "بجاية" },
  { code: "07", slug: "biskra", name_en: "Biskra", name_ar: "بسكرة" },
  { code: "08", slug: "bechar", name_en: "Béchar", name_ar: "بشار" },
  { code: "09", slug: "blida", name_en: "Blida", name_ar: "البليدة" },
  { code: "10", slug: "bouira", name_en: "Bouira", name_ar: "البويرة" },
  { code: "11", slug: "tamanrasset", name_en: "Tamanrasset", name_ar: "تمنراست" },
  { code: "12", slug: "tebessa", name_en: "Tébessa", name_ar: "تبسة" },
  { code: "13", slug: "tlemcen", name_en: "Tlemcen", name_ar: "تلمسان" },
  { code: "14", slug: "tiaret", name_en: "Tiaret", name_ar: "تيارت" },
  { code: "15", slug: "tizi-ouzou", name_en: "Tizi Ouzou", name_ar: "تيزي وزو" },
  { code: "16", slug: "algiers", name_en: "Algiers", name_ar: "الجزائر" },
  { code: "17", slug: "djelfa", name_en: "Djelfa", name_ar: "الجلفة" },
  { code: "18", slug: "jijel", name_en: "Jijel", name_ar: "جيجل" },
  { code: "19", slug: "setif", name_en: "Sétif", name_ar: "سطيف" },
  { code: "20", slug: "saida", name_en: "Saïda", name_ar: "سعيدة" },
  { code: "21", slug: "skikda", name_en: "Skikda", name_ar: "سكيكدة" },
  { code: "22", slug: "sidi-bel-abbes", name_en: "Sidi Bel Abbès", name_ar: "سيدي بلعباس" },
  { code: "23", slug: "annaba", name_en: "Annaba", name_ar: "عنابة" },
  { code: "24", slug: "guelma", name_en: "Guelma", name_ar: "قالمة" },
  { code: "25", slug: "constantine", name_en: "Constantine", name_ar: "قسنطينة" },
  { code: "26", slug: "medea", name_en: "Médéa", name_ar: "المدية" },
  { code: "27", slug: "mostaganem", name_en: "Mostaganem", name_ar: "مستغانم" },
  { code: "28", slug: "msila", name_en: "M'Sila", name_ar: "المسيلة" },
  { code: "29", slug: "mascara", name_en: "Mascara", name_ar: "معسكر" },
  { code: "30", slug: "ouargla", name_en: "Ouargla", name_ar: "ورقلة" },
  { code: "31", slug: "oran", name_en: "Oran", name_ar: "وهران" },
  { code: "32", slug: "el-bayadh", name_en: "El Bayadh", name_ar: "البيض" },
  { code: "33", slug: "illizi", name_en: "Illizi", name_ar: "إليزي" },
  { code: "34", slug: "bordj-bou-arreridj", name_en: "Bordj Bou Arréridj", name_ar: "برج بوعريريج" },
  { code: "35", slug: "boumerdes", name_en: "Boumerdès", name_ar: "بومرداس" },
  { code: "36", slug: "el-tarf", name_en: "El Tarf", name_ar: "الطارف" },
  { code: "37", slug: "tindouf", name_en: "Tindouf", name_ar: "تندوف" },
  { code: "38", slug: "tissemsilt", name_en: "Tissemsilt", name_ar: "تيسمسيلت" },
  { code: "39", slug: "el-oued", name_en: "El Oued", name_ar: "الوادي" },
  { code: "40", slug: "khenchela", name_en: "Khenchela", name_ar: "خنشلة" },
  { code: "41", slug: "souk-ahras", name_en: "Souk Ahras", name_ar: "سوق أهراس" },
  { code: "42", slug: "tipaza", name_en: "Tipaza", name_ar: "تيبازة" },
  { code: "43", slug: "mila", name_en: "Mila", name_ar: "ميلة" },
  { code: "44", slug: "ain-defla", name_en: "Aïn Defla", name_ar: "عين الدفلى" },
  { code: "45", slug: "naama", name_en: "Naâma", name_ar: "النعامة" },
  { code: "46", slug: "ain-temouchent", name_en: "Aïn Témouchent", name_ar: "عين تموشنت" },
  { code: "47", slug: "ghardaia", name_en: "Ghardaïa", name_ar: "غرداية" },
  { code: "48", slug: "relizane", name_en: "Relizane", name_ar: "غليزان" },
  { code: "49", slug: "timimoun", name_en: "Timimoun", name_ar: "تيميمون" },
  { code: "50", slug: "bordj-badji-mokhtar", name_en: "Bordj Badji Mokhtar", name_ar: "برج باجي مختار" },
  { code: "51", slug: "ouled-djellal", name_en: "Ouled Djellal", name_ar: "أولاد جلال" },
  { code: "52", slug: "beni-abbes", name_en: "Béni Abbès", name_ar: "بني عباس" },
  { code: "53", slug: "in-salah", name_en: "In Salah", name_ar: "عين صالح" },
  { code: "54", slug: "in-guezzam", name_en: "In Guezzam", name_ar: "عين قزام" },
  { code: "55", slug: "touggourt", name_en: "Touggourt", name_ar: "تقرت" },
  { code: "56", slug: "djanet", name_en: "Djanet", name_ar: "جانت" },
  { code: "57", slug: "el-mghair", name_en: "El M'Ghair", name_ar: "المغير" },
  { code: "58", slug: "el-menia", name_en: "El Meniaa", name_ar: "المنيعة" }
] as const

/**
 * Get wilaya by slug
 */
export function getWilayaBySlug(slug: string | null | undefined): Wilaya | null {
  if (!slug) return null
  const normalized = slug.toLowerCase().trim()
  return ALGERIA_WILAYAS.find(w => w.slug === normalized) || null
}

/**
 * Get wilaya name for display (English by default)
 */
export function getWilayaName(slug: string | null | undefined, language: 'en' | 'ar' = 'en'): string {
  const wilaya = getWilayaBySlug(slug)
  if (!wilaya) return slug || 'Unknown'
  return language === 'ar' ? wilaya.name_ar : wilaya.name_en
}

/**
 * Map legacy city names to wilaya slugs (backward compatibility)
 */
export function mapLegacyCityToWilaya(cityName: string | null | undefined): string | null {
  if (!cityName) return null
  
  const normalized = cityName.toLowerCase().trim()
  
  // Direct matches
  const directMatch = ALGERIA_WILAYAS.find(w => 
    w.slug === normalized || 
    w.name_en.toLowerCase() === normalized ||
    w.name_ar === cityName.trim()
  )
  
  if (directMatch) return directMatch.slug
  
  // Common variations
  const variations: Record<string, string> = {
    'alger': 'algiers',
    'algier': 'algiers',
    'bejaia': 'bejaia',
    'béjaia': 'bejaia',
    'constantine': 'constantine',
    'oran': 'oran',
    'wahran': 'oran',
    'tizi': 'tizi-ouzou',
    'setif': 'setif',
    'sétif': 'setif',
    'annaba': 'annaba',
    'batna': 'batna',
    'blida': 'blida',
    'tlemcen': 'tlemcen',
  }
  
  return variations[normalized] || null
}

/**
 * Validate wilaya slug
 */
export function isValidWilayaSlug(slug: string | null | undefined): boolean {
  if (!slug) return false
  return ALGERIA_WILAYAS.some(w => w.slug === slug.toLowerCase().trim())
}

/**
 * Get all wilaya options for dropdowns
 */
export function getWilayaOptions(language: 'en' | 'ar' = 'en'): Array<{ value: string; label: string }> {
  return ALGERIA_WILAYAS.map(w => ({
    value: w.slug,
    label: language === 'ar' ? w.name_ar : w.name_en
  }))
}
