import type {Metadata} from "next";

import {
  CONTACT_INFO,
  CORE_SERVICE_LABELS,
  GOOGLE_BUSINESS_LINK,
  INSTAGRAM_LINK,
  WHATSAPP_LINK,
} from "@/constants/homepage";
import {type AppLocale, defaultLocale} from "@/i18n/routing";
import {
  buildLanguageAlternates,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_PATH,
  DEFAULT_OG_IMAGE_WIDTH,
  localeToLanguageTag,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

export type SeoPageKey =
  | "services"
  | "haircut"
  | "fade"
  | "beard"
  | "hairColoring"
  | "hotelHomeService"
  | "contact"
  | "gallery";

export const SEO_PAGE_PATHS: Record<SeoPageKey, string> = {
  services: "/services",
  haircut: "/services/haircut",
  fade: "/services/fade",
  beard: "/services/beard",
  hairColoring: "/services/hair-coloring",
  hotelHomeService: "/services/hotel-home-service",
  contact: "/contact",
  gallery: "/gallery",
};

interface SeoPageCopy {
  title: string;
  description: string;
  heading: string;
  summary: string;
  keywords: string[];
}

interface FaqItem {
  question: string;
  answer: string;
}

const COPY: Record<AppLocale, Record<SeoPageKey, SeoPageCopy>> = {
  tr: {
    services: {
      title: "Barber Hizmetleri | Alicutz Istanbul",
      description: "Alicutz Istanbul barber hizmetleri: saç kesimi, fade, sakal, saç renklendirme ve özel randevu.",
      heading: "Profesyonel Barber Hizmetleri",
      summary: "Şişli, Osmanbey ve Bomonti bölgesinde premium barber hizmetleri.",
      keywords: ["barber istanbul", "barber şişli", "premium barber istanbul", "barber bomonti"],
    },
    haircut: {
      title: "Saç Kesimi | Profesyonel Barber Istanbul",
      description: "Yüz hatlarına uygun premium erkek saç kesimi hizmeti. Alicutz ile Istanbul'da profesyonel barber deneyimi.",
      heading: "Saç Kesimi",
      summary: "Modern ve klasik erkek saç kesiminde yüz hattına uygun, temiz ve tutarlı sonuç.",
      keywords: ["erkek saç kesimi", "men's haircut istanbul", "Haircut Istanbul"],
    },
    fade: {
      title: "Fade | Skin Fade Istanbul",
      description: "Temiz geçişli low, mid ve high skin fade uygulamaları. Istanbul'da premium barber fade hizmeti.",
      heading: "Fade Hizmeti",
      summary: "Skin fade, taper fade ve modern fade haircut çizgisinde net geçişler.",
      keywords: ["fade haircut", "skin fade", "taper fade"],
    },
    beard: {
      title: "Sakal Trim ve Şekillendirme | Barber Istanbul",
      description: "Sakal trim, kontür ve şekillendirme hizmetleri ile yüz hatlarına uygun profesyonel görünüm.",
      heading: "Sakal Trim ve Şekillendirme",
      summary: "Yüz oranına uygun sakal detayları ve temiz çizgiler.",
      keywords: ["beard trim", "sakal tıraşı", "Beard Styling Istanbul"],
    },
    hairColoring: {
      title: "Saç Renklendirme | Barber Istanbul",
      description: "Doğal ve premium sonuçlar için erkek saç renklendirme hizmeti. Alicutz Istanbul.",
      heading: "Saç Renklendirme",
      summary: "Saç dokusunu koruyan profesyonel renklendirme uygulamaları.",
      keywords: ["men's hair color", "saç boyama erkek", "Hair Coloring Istanbul"],
    },
    hotelHomeService: {
      title: "Otel ve Evde Barber Servisi | Istanbul",
      description: "Şişli, Osmanbey, Bomonti ve çevresinde otel ve evde premium barber randevusu.",
      heading: "Otel ve Evde Barber Servisi",
      summary: "Zamanı değerli misafirler için yerinde profesyonel barber hizmeti.",
      keywords: ["hotel barber istanbul", "home barber istanbul", "Premium Barber Istanbul"],
    },
    contact: {
      title: "İletişim ve Randevu | Alicutz",
      description: "Alicutz iletişim sayfası. WhatsApp üzerinden hızlı rezervasyon ve konum bilgisi.",
      heading: "İletişim ve Randevu",
      summary: "Şişli, Osmanbey, Bomonti ve Istanbul genelinde WhatsApp ile hızlı randevu planlaması.",
      keywords: ["Barber Contact Istanbul", "WhatsApp Barber Istanbul", "Alicutz"],
    },
    gallery: {
      title: "Galeri | Alicutz Barber Çalışmaları",
      description: "Alicutz Istanbul barber çalışmalarından seçili sonuçlar. Fade, sakal ve saç kesimi örnekleri.",
      heading: "Barber Galeri",
      summary: "Gerçek müşteri sonuçlarından seçili premium barber çalışmaları.",
      keywords: ["Barber Gallery Istanbul", "Fade Gallery", "Haircut Istanbul"],
    },
  },
  en: {
    services: {
      title: "Barber Services | Alicutz Istanbul",
      description: "Professional barber services in Istanbul including haircut, fade, beard trim, hair coloring, and private appointments.",
      heading: "Professional Barber Services",
      summary: "Premium barber service coverage in Sisli, Osmanbey, and Bomonti.",
      keywords: ["barber istanbul", "barber şişli", "premium barber istanbul", "barber bomonti"],
    },
    haircut: {
      title: "Haircut Service | Professional Barber Istanbul",
      description: "Precision haircut service tailored to face shape and lifestyle by a professional barber in Istanbul.",
      heading: "Haircut Service",
      summary: "Clean, face-shape-aware men's haircut work with consistent premium standards.",
      keywords: ["men's haircut istanbul", "erkek saç kesimi", "Haircut Istanbul"],
    },
    fade: {
      title: "Fade Service | Skin Fade Istanbul",
      description: "Low, mid, and high skin fade services with clean transitions and premium finishing.",
      heading: "Fade Service",
      summary: "Skin fade, taper fade, and modern fade haircut execution with clean transitions.",
      keywords: ["fade haircut", "skin fade", "taper fade"],
    },
    beard: {
      title: "Beard Trim Service | Barber Istanbul",
      description: "Professional beard trim and styling for clean contour, structure, and balanced profile.",
      heading: "Beard Trim Service",
      summary: "Defined beard lines and balanced beard trim for a sharp professional profile.",
      keywords: ["beard trim", "sakal tıraşı", "Beard Trim Istanbul"],
    },
    hairColoring: {
      title: "Hair Coloring Service | Barber Istanbul",
      description: "Professional men's hair coloring with natural-looking tone correction and healthy finish.",
      heading: "Hair Coloring Service",
      summary: "Premium coloring process designed for modern men's styles.",
      keywords: ["men's hair color", "saç boyama erkek", "Hair Coloring Istanbul"],
    },
    hotelHomeService: {
      title: "Hotel and Home Barber Service | Istanbul",
      description: "Private hotel and home barber appointments across Sisli, Osmanbey, and Bomonti in Istanbul.",
      heading: "Hotel and Home Barber Service",
      summary: "Luxury on-location barber appointments for travelers and residents.",
      keywords: ["hotel barber istanbul", "home barber istanbul", "Private Barber Istanbul"],
    },
    contact: {
      title: "Contact and Booking | Alicutz",
      description: "Book your barber appointment via WhatsApp and request exact location details in Istanbul.",
      heading: "Contact and Booking",
      summary: "Fast WhatsApp booking for clients in Şişli, Osmanbey, Bomonti, and Istanbul.",
      keywords: ["Barber Contact Istanbul", "WhatsApp Booking Barber", "Alicutz"],
    },
    gallery: {
      title: "Gallery | Alicutz Barber Portfolio",
      description: "Selected haircut, fade, and beard results from Alicutz premium barber appointments in Istanbul.",
      heading: "Barber Gallery",
      summary: "A curated portfolio of premium barber work in Istanbul.",
      keywords: ["Barber Gallery Istanbul", "Fade Portfolio", "Haircut Portfolio"],
    },
  },
  de: {
    services: {
      title: "Barber Services | Alicutz Istanbul",
      description: "Professionelle Barber-Services in Istanbul: Haarschnitt, Fade, Barttrim, Haarfarbe und private Termine.",
      heading: "Professionelle Barber-Services",
      summary: "Premium Barber-Service in Sisli, Osmanbey und Bomonti.",
      keywords: ["Barber Istanbul", "Professioneller Barber", "Barber Bomonti"],
    },
    haircut: {
      title: "Haarschnitt | Professioneller Barber Istanbul",
      description: "Präziser Herrenhaarschnitt passend zu Gesichtsform und Stil beim professionellen Barber in Istanbul.",
      heading: "Haarschnitt",
      summary: "Saubere, konsistente Haarschnitte für Premium-Kunden.",
      keywords: ["Haarschnitt Istanbul", "Barber Istanbul", "Professioneller Barber"],
    },
    fade: {
      title: "Fade Service | Skin Fade Istanbul",
      description: "Low-, Mid- und High-Skin-Fade mit sauberen Übergängen und präzisem Finish.",
      heading: "Fade Service",
      summary: "Skin-Fade-Arbeit mit klaren Details und moderner Balance.",
      keywords: ["Skin Fade Istanbul", "Fade Istanbul", "Barber Istanbul"],
    },
    beard: {
      title: "Barttrim Service | Barber Istanbul",
      description: "Professionelles Barttrimmen und Bartstyling für saubere Konturen und ein ausgewogenes Profil.",
      heading: "Barttrim Service",
      summary: "Definierte Bartlinien und präzise Formarbeit.",
      keywords: ["Bart Styling Istanbul", "Barttrim Istanbul", "Barber"],
    },
    hairColoring: {
      title: "Haarfärbung | Barber Istanbul",
      description: "Professionelle Herren-Haarfärbung mit natürlicher Tonkorrektur und gesundem Finish.",
      heading: "Haarfärbung",
      summary: "Premium-Farbservice für moderne Herrenstyles.",
      keywords: ["Haarfärbung Istanbul", "Barber Istanbul", "Premium Barber"],
    },
    hotelHomeService: {
      title: "Hotel- und Home-Barber-Service | Istanbul",
      description: "Private Barber-Termine im Hotel und Zuhause in Sisli, Osmanbey und Bomonti.",
      heading: "Hotel- und Home-Barber-Service",
      summary: "Luxuriöse Vor-Ort-Termine für Reisende und Bewohner.",
      keywords: ["Hotel Barber Istanbul", "Home Barber Istanbul", "Privater Barber"],
    },
    contact: {
      title: "Kontakt und Buchung | Alicutz",
      description: "Barber-Termin via WhatsApp buchen und exakte Standortdetails in Istanbul erhalten.",
      heading: "Kontakt und Buchung",
      summary: "Schneller WhatsApp-Flow für Premium-Barber-Termine.",
      keywords: ["Barber Kontakt Istanbul", "WhatsApp Barber", "Alicutz"],
    },
    gallery: {
      title: "Galerie | Alicutz Barber Portfolio",
      description: "Ausgewählte Ergebnisse aus Haarschnitt, Fade und Bartservice von Alicutz in Istanbul.",
      heading: "Barber Galerie",
      summary: "Kuratiertes Portfolio mit Premium-Barber-Ergebnissen.",
      keywords: ["Barber Galerie Istanbul", "Fade Portfolio", "Haarschnitt Portfolio"],
    },
  },
  fa: {
    services: {
      title: "خدمات باربر | Alicutz استانبول",
      description: "خدمات حرفه‌ای باربر در استانبول شامل اصلاح مو، فید، تریم ریش، رنگ مو و نوبت خصوصی.",
      heading: "خدمات حرفه‌ای باربر",
      summary: "پوشش سرویس پریمیوم در شیشلی، عثمان‌بی و بومونتی.",
      keywords: ["باربر استانبول", "آرایشگر حرفه‌ای مردانه", "باربر بومونتی"],
    },
    haircut: {
      title: "اصلاح مو | آرایشگر حرفه‌ای مردانه",
      description: "اصلاح موی حرفه‌ای متناسب با فرم صورت و استایل روزانه در استانبول.",
      heading: "اصلاح مو",
      summary: "نتیجه تمیز و ثابت برای مشتریان پریمیوم.",
      keywords: ["اصلاح مو استانبول", "باربر استانبول", "آرایشگر حرفه‌ای مردانه"],
    },
    fade: {
      title: "فید | Skin Fade Istanbul",
      description: "خدمات فید با گذار تمیز و جزئیات دقیق در استاندارد پریمیوم.",
      heading: "خدمات فید",
      summary: "اسکین فید حرفه‌ای با توازن مدرن.",
      keywords: ["فید استانبول", "Skin Fade Istanbul", "باربر"],
    },
    beard: {
      title: "تریم ریش | باربر استانبول",
      description: "تریم و فرم‌دهی ریش با خط‌سازی تمیز و تناسب طبیعی چهره.",
      heading: "تریم ریش",
      summary: "خط ریش دقیق و فرم حرفه‌ای متناسب با صورت.",
      keywords: ["تریم ریش استانبول", "Beard Styling Istanbul", "باربر"],
    },
    hairColoring: {
      title: "رنگ مو | باربر استانبول",
      description: "خدمات رنگ موی مردانه با اصلاح تون طبیعی و نتیجه سالم.",
      heading: "رنگ مو",
      summary: "فرایند رنگ حرفه‌ای برای استایل مردانه مدرن.",
      keywords: ["رنگ مو استانبول", "Hair Coloring Istanbul", "باربر"],
    },
    hotelHomeService: {
      title: "باربر در هتل و منزل | استانبول",
      description: "نوبت خصوصی باربر در هتل و منزل در شیشلی، عثمان‌بی و بومونتی.",
      heading: "باربر در هتل و منزل",
      summary: "خدمات لوکس در محل برای مسافران و ساکنان.",
      keywords: ["Hotel Barber Istanbul", "Home Barber Istanbul", "باربر خصوصی"],
    },
    contact: {
      title: "تماس و رزرو | Alicutz",
      description: "رزرو سریع از طریق واتساپ و دریافت موقعیت دقیق خدمت در استانبول.",
      heading: "تماس و رزرو",
      summary: "جریان رزرو سریع برای نوبت‌های پریمیوم باربر.",
      keywords: ["تماس باربر استانبول", "رزرو واتساپ", "Alicutz"],
    },
    gallery: {
      title: "گالری | نمونه‌کار باربر Alicutz",
      description: "نمونه‌کارهای منتخب اصلاح مو، فید و ریش از نوبت‌های پریمیوم Alicutz.",
      heading: "گالری باربر",
      summary: "پورتفولیوی منتخب از نتایج واقعی باربر در استانبول.",
      keywords: ["گالری باربر استانبول", "Fade Portfolio", "Haircut Portfolio"],
    },
  },
  ar: {
    services: {
      title: "خدمات الحلاق | Alicutz إسطنبول",
      description: "خدمات حلاق رجالي محترف في إسطنبول: قص شعر، فيد، تهذيب لحية، تلوين شعر، ومواعيد خاصة.",
      heading: "خدمات حلاق رجالي محترف",
      summary: "تغطية خدمة فاخرة في شيشلي وعثمان بي وبومونتي.",
      keywords: ["حلاق رجالي إسطنبول", "Barber Istanbul", "حلاق بومونتي"],
    },
    haircut: {
      title: "قص الشعر | حلاق رجالي محترف",
      description: "خدمة قص شعر احترافية تناسب شكل الوجه ونمط الحياة في إسطنبول.",
      heading: "قص الشعر",
      summary: "نتائج نظيفة وثابتة لعملاء الخدمة الفاخرة.",
      keywords: ["قص شعر إسطنبول", "حلاق رجالي إسطنبول", "Barber"],
    },
    fade: {
      title: "خدمة الفيد | Skin Fade Istanbul",
      description: "خدمة فيد باحتراف مع انتقالات نظيفة وتفاصيل دقيقة.",
      heading: "خدمة الفيد",
      summary: "Skin fade متقن بتوازن عصري.",
      keywords: ["Skin Fade Istanbul", "فيد إسطنبول", "Barber Istanbul"],
    },
    beard: {
      title: "تهذيب اللحية | Barber Istanbul",
      description: "تهذيب وتحديد اللحية بخطوط واضحة وتناسب مثالي مع ملامح الوجه.",
      heading: "تهذيب اللحية",
      summary: "تحديد احترافي للّحية بمظهر متوازن.",
      keywords: ["Beard Styling Istanbul", "تهذيب اللحية إسطنبول", "Barber"],
    },
    hairColoring: {
      title: "تلوين الشعر | Barber Istanbul",
      description: "خدمة تلوين شعر رجالي بنتيجة طبيعية وصحية بلمسة احترافية.",
      heading: "تلوين الشعر",
      summary: "تلوين احترافي للشعر الرجالي بأسلوب عصري.",
      keywords: ["Hair Coloring Istanbul", "تلوين شعر إسطنبول", "Barber"],
    },
    hotelHomeService: {
      title: "حلاق في الفندق والمنزل | إسطنبول",
      description: "مواعيد حلاق خاصة في الفندق والمنزل ضمن شيشلي وعثمان بي وبومونتي.",
      heading: "حلاق في الفندق والمنزل",
      summary: "خدمة فاخرة في موقعك للمسافرين والمقيمين.",
      keywords: ["Hotel Barber Istanbul", "Home Barber Istanbul", "حلاق خاص"],
    },
    contact: {
      title: "التواصل والحجز | Alicutz",
      description: "احجز عبر واتساب واحصل على تفاصيل الموقع بدقة في إسطنبول.",
      heading: "التواصل والحجز",
      summary: "حجز سريع لمواعيد الحلاق الفاخرة.",
      keywords: ["تواصل حلاق إسطنبول", "حجز واتساب", "Alicutz"],
    },
    gallery: {
      title: "المعرض | أعمال Barber Alicutz",
      description: "نتائج مختارة من قص الشعر والفيد واللحية من مواعيد Alicutz في إسطنبول.",
      heading: "معرض أعمال الحلاق",
      summary: "أعمال حقيقية مختارة من خدمة الحلاق الفاخرة.",
      keywords: ["معرض حلاق إسطنبول", "Fade Portfolio", "Haircut Portfolio"],
    },
  },
  ru: {
    services: {
      title: "Барбер услуги | Alicutz Стамбул",
      description: "Профессиональные барбер-услуги в Стамбуле: стрижка, fade, трим бороды, окрашивание и приватные записи.",
      heading: "Профессиональные барбер-услуги",
      summary: "Премиальный сервис в Шишли, Османбей и Бомонти.",
      keywords: ["Барбер Стамбул", "Профессиональный Барбер", "Barber Bomonti"],
    },
    haircut: {
      title: "Стрижка | Профессиональный Барбер",
      description: "Профессиональная мужская стрижка под форму лица и стиль жизни в Стамбуле.",
      heading: "Стрижка",
      summary: "Чистый и стабильный результат для премиальных клиентов.",
      keywords: ["Haircut Istanbul", "Стрижка Стамбул", "Профессиональный Барбер"],
    },
    fade: {
      title: "Fade услуга | Skin Fade Istanbul",
      description: "Fade-работа с чистыми переходами и точной детализацией в премиальном стандарте.",
      heading: "Fade услуга",
      summary: "Skin fade с четким балансом и аккуратным финишем.",
      keywords: ["Skin Fade Istanbul", "Fade Стамбул", "Барбер Стамбул"],
    },
    beard: {
      title: "Трим бороды | Барбер Стамбул",
      description: "Профессиональный трим и оформление бороды с точным контуром и пропорцией.",
      heading: "Трим бороды",
      summary: "Четкая линия бороды и аккуратная форма для премиального образа.",
      keywords: ["Beard Styling Istanbul", "Трим бороды Стамбул", "Барбер"],
    },
    hairColoring: {
      title: "Окрашивание волос | Барбер Стамбул",
      description: "Мужское окрашивание волос с естественной тоновой коррекцией и здоровым результатом.",
      heading: "Окрашивание волос",
      summary: "Премиальный цветовой сервис для современных мужских стилей.",
      keywords: ["Hair Coloring Istanbul", "Окрашивание Стамбул", "Барбер"],
    },
    hotelHomeService: {
      title: "Барбер в отеле и на дому | Стамбул",
      description: "Приватные выезды барбера в отели и резиденции в районах Шишли, Османбей и Бомонти.",
      heading: "Барбер в отеле и на дому",
      summary: "Люксовый формат обслуживания на вашей локации.",
      keywords: ["Hotel Barber Istanbul", "Home Barber Istanbul", "Private Barber"],
    },
    contact: {
      title: "Контакты и запись | Alicutz",
      description: "Запись через WhatsApp и быстрый доступ к точной информации по локации в Стамбуле.",
      heading: "Контакты и запись",
      summary: "Быстрый WhatsApp-флоу для премиальных барбер-записей.",
      keywords: ["Контакты барбер Стамбул", "WhatsApp барбер", "Alicutz"],
    },
    gallery: {
      title: "Галерея | Портфолио барбера Alicutz",
      description: "Избранные результаты стрижек, fade и бороды из премиальных записей Alicutz.",
      heading: "Галерея барбера",
      summary: "Кураторское портфолио реальных барбер-результатов в Стамбуле.",
      keywords: ["Галерея барбер Стамбул", "Fade Portfolio", "Haircut Portfolio"],
    },
  },
};

const LANDING_FAQ: Record<AppLocale, FaqItem[]> = {
  tr: [
    {question: "Randevu nasıl alabilirim?", answer: "WhatsApp üzerinden tarih, saat ve hizmet bilgisini gönderin. Uygunluğu hızlıca teyit ediyoruz."},
    {question: "Randevusuz müşteri kabul ediyor musunuz?", answer: "Premium servis kalitesini korumak için önceliğimiz randevulu çalışmaktır."},
    {question: "Otelde hizmet veriyor musunuz?", answer: "Evet. Şişli, Osmanbey, Bomonti ve çevresinde otelde barber hizmeti sunuyoruz."},
    {question: "İngilizce konuşuyor musunuz?", answer: "Evet, rezervasyon ve danışmanlık sürecini İngilizce yürütebiliriz."},
    {question: "Almanca konuşuyor musunuz?", answer: "Evet, Almanca iletişim desteği veriyoruz."},
    {question: "Farsça konuşuyor musunuz?", answer: "Evet, Farsça iletişim desteği veriyoruz."},
    {question: "Bir saç kesimi ortalama ne kadar sürer?", answer: "Saç yapısı ve seçilen stile bağlı olarak çoğu saç kesimi yaklaşık 35-50 dakika sürer."},
  ],
  en: [
    {question: "How do I book?", answer: "Send your preferred date, time, and service on WhatsApp. We confirm availability quickly."},
    {question: "Do you accept walk-ins?", answer: "To keep premium service quality consistent, we primarily work by appointment."},
    {question: "Do you provide hotel service?", answer: "Yes. We provide hotel barber service across Sisli, Osmanbey, Bomonti, and central Istanbul."},
    {question: "Do you speak English?", answer: "Yes, consultations and booking communication are available in English."},
    {question: "Do you speak German?", answer: "Yes, German communication support is available."},
    {question: "Do you speak Persian?", answer: "Yes, Persian communication support is available."},
    {question: "How long does a haircut take?", answer: "Most men's haircut sessions take around 35 to 50 minutes depending on hair type and style."},
  ],
  de: [
    {question: "Wie buche ich einen Termin?", answer: "Senden Sie Datum, Uhrzeit und Servicewunsch per WhatsApp. Wir bestätigen die Verfügbarkeit schnell."},
    {question: "Akzeptieren Sie Laufkundschaft?", answer: "Für gleichbleibende Premium-Qualität arbeiten wir in der Regel mit Termin."},
    {question: "Bieten Sie Hotelservice an?", answer: "Ja. Wir bieten Hotelservice in Sisli, Osmanbey, Bomonti und zentralem Istanbul an."},
    {question: "Sprechen Sie Englisch?", answer: "Ja, Beratung und Buchung sind auf Englisch möglich."},
    {question: "Sprechen Sie Deutsch?", answer: "Ja, Kommunikation auf Deutsch ist möglich."},
    {question: "Sprechen Sie Persisch?", answer: "Ja, Kommunikation auf Persisch ist möglich."},
    {question: "Wie lange dauert ein Haarschnitt?", answer: "Die meisten Herrenhaarschnitte dauern je nach Haartyp und Stil etwa 35 bis 50 Minuten."},
  ],
  fa: [
    {question: "چطور نوبت رزرو کنم؟", answer: "تاریخ، ساعت و خدمت مورد نظر را در واتساپ ارسال کنید تا سریع تایید شود."},
    {question: "مشتری بدون نوبت می پذیرید؟", answer: "برای حفظ کیفیت پریمیوم، اولویت با رزرو قبلی است."},
    {question: "خدمات هتل ارائه می دهید؟", answer: "بله. در شیشلی، عثمان‌بی، بومونتی و مرکز استانبول خدمات هتل ارائه می‌شود."},
    {question: "آیا انگلیسی صحبت می کنید؟", answer: "بله، مشاوره و رزرو به زبان انگلیسی انجام می‌شود."},
    {question: "آیا آلمانی صحبت می کنید؟", answer: "بله، ارتباط به زبان آلمانی نیز امکان‌پذیر است."},
    {question: "آیا فارسی صحبت می کنید؟", answer: "بله، ارتباط کامل به زبان فارسی انجام می‌شود."},
    {question: "اصلاح مو معمولاً چقدر زمان می برد؟", answer: "بیشتر نوبت‌های اصلاح مو با توجه به مدل و جنس مو حدود 35 تا 50 دقیقه زمان می‌برد."},
  ],
  ar: [
    {question: "كيف أحجز؟", answer: "أرسل التاريخ والوقت والخدمة المطلوبة عبر واتساب، وسنؤكد الموعد بسرعة."},
    {question: "هل تقبلون بدون موعد؟", answer: "للحفاظ على جودة خدمة فاخرة ثابتة، نعتمد أساساً على نظام المواعيد."},
    {question: "هل تقدمون خدمة الفندق؟", answer: "نعم. نقدم خدمة الحلاق في الفنادق ضمن شيشلي وعثمان بي وبومونتي ومركز إسطنبول."},
    {question: "هل تتحدثون الإنجليزية؟", answer: "نعم، الاستشارة والحجز متاحان باللغة الإنجليزية."},
    {question: "هل تتحدثون الألمانية؟", answer: "نعم، نوفر دعماً للتواصل باللغة الألمانية."},
    {question: "هل تتحدثون الفارسية؟", answer: "نعم، نوفر دعماً للتواصل باللغة الفارسية."},
    {question: "كم يستغرق قص الشعر عادة؟", answer: "غالباً يستغرق قص الشعر الرجالي بين 35 و50 دقيقة حسب نوع الشعر والموديل."},
  ],
  ru: [
    {question: "Как записаться?", answer: "Отправьте дату, время и нужную услугу в WhatsApp, и мы быстро подтвердим запись."},
    {question: "Принимаете без записи?", answer: "Чтобы сохранять премиальный уровень сервиса, мы в основном работаем по предварительной записи."},
    {question: "Вы делаете выезд в отель?", answer: "Да. Мы предоставляем выездной сервис в отели в районах Шишли, Османбей, Бомонти и центре Стамбула."},
    {question: "Вы говорите по-английски?", answer: "Да, консультация и бронирование доступны на английском языке."},
    {question: "Вы говорите по-немецки?", answer: "Да, мы поддерживаем общение на немецком языке."},
    {question: "Вы говорите по-персидски?", answer: "Да, мы поддерживаем общение на персидском языке."},
    {question: "Сколько длится мужская стрижка?", answer: "В среднем мужская стрижка занимает 35-50 минут в зависимости от структуры волос и выбранного стиля."},
  ],
};

export function getLandingFaq(locale: AppLocale): FaqItem[] {
  return LANDING_FAQ[locale] ?? LANDING_FAQ[defaultLocale];
}

export function getLandingCtaLabel(locale: AppLocale): string {
  const labels: Record<AppLocale, string> = {
    tr: "WhatsApp'tan Randevu Al",
    en: "Book via WhatsApp",
    de: "Per WhatsApp buchen",
    fa: "رزرو از طریق واتساپ",
    ar: "احجز عبر واتساب",
    ru: "Записаться через WhatsApp",
  };

  return labels[locale] ?? labels[defaultLocale];
}

export function getSeoPageCopy(locale: AppLocale, pageKey: SeoPageKey): SeoPageCopy {
  return COPY[locale]?.[pageKey] ?? COPY[defaultLocale][pageKey];
}

export function buildSeoPageMetadata(locale: AppLocale, pageKey: SeoPageKey): Metadata {
  const copy = getSeoPageCopy(locale, pageKey);
  const pathname = SEO_PAGE_PATHS[pageKey];
  const localeTag = localeToLanguageTag[locale];

  return {
    title: copy.title,
    description: copy.description,
    keywords: copy.keywords,
    alternates: {
      canonical: `${SITE_URL}/${locale}${pathname}`,
      languages: buildLanguageAlternates(pathname),
    },
    openGraph: {
      title: copy.title,
      description: copy.description,
      url: `${SITE_URL}/${locale}${pathname}`,
      locale: localeTag,
      siteName: SITE_NAME,
      type: "website",
      images: [
        {
          url: `${SITE_URL}${DEFAULT_OG_IMAGE_PATH}`,
          width: DEFAULT_OG_IMAGE_WIDTH,
          height: DEFAULT_OG_IMAGE_HEIGHT,
          alt: copy.heading,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.description,
      images: [`${SITE_URL}${DEFAULT_OG_IMAGE_PATH}`],
    },
  };
}

export function buildSeoPageSchemas(locale: AppLocale, pageKey: SeoPageKey): Record<string, unknown>[] {
  const copy = getSeoPageCopy(locale, pageKey);
  const pathname = SEO_PAGE_PATHS[pageKey];
  const pageUrl = `${SITE_URL}/${locale}${pathname}`;

  const localBusiness = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "HairSalon", "Barbershop"],
    name: "Alicutz",
    category: "Barber Shop",
    priceRange: "$$",
    url: pageUrl,
    image: `${SITE_URL}${DEFAULT_OG_IMAGE_PATH}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Osmanbey / Bomonti / Sisli",
      addressRegion: "Istanbul",
      addressCountry: "TR",
    },
    areaServed: ["Istanbul", "Sisli", "Osmanbey", "Bomonti"],
    knowsLanguage: ["Turkish", "English", "German", "Persian", "Arabic", "Russian"],
    telephone: CONTACT_INFO.phone,
    email: CONTACT_INFO.email,
    sameAs: [INSTAGRAM_LINK, GOOGLE_BUSINESS_LINK],
    potentialAction: {
      "@type": "ReserveAction",
      target: WHATSAPP_LINK,
      name: "Book via WhatsApp",
    },
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${SITE_URL}/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: copy.heading,
        item: pageUrl,
      },
    ],
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Alicutz",
    url: `${SITE_URL}/${locale}`,
    inLanguage: locale,
  };

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Alicutz",
    url: `${SITE_URL}/${locale}`,
    logo: `${SITE_URL}/icon?size=512`,
    sameAs: [INSTAGRAM_LINK, GOOGLE_BUSINESS_LINK],
  };

  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: copy.heading,
    description: copy.summary,
    areaServed: "Istanbul",
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: WHATSAPP_LINK,
      servicePhone: CONTACT_INFO.phone,
    },
    provider: {
      "@type": "Barbershop",
      name: "Alicutz",
      url: `${SITE_URL}/${locale}`,
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Barber Services",
      itemListElement: CORE_SERVICE_LABELS.map((entry, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Service",
          name: entry,
        },
      })),
    },
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: getLandingFaq(locale).map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return [localBusiness, breadcrumb, website, organization, service, faq];
}

export function getSeoPageLinks(locale: AppLocale, pageKey: SeoPageKey): Array<{href: string; label: string}> {
  const order: SeoPageKey[] = [
    "services",
    "haircut",
    "fade",
    "beard",
    "hairColoring",
    "hotelHomeService",
    "gallery",
    "contact",
  ];

  return order
    .filter((entry) => entry !== pageKey)
    .slice(0, 5)
    .map((entry) => ({
      href: `/${locale}${SEO_PAGE_PATHS[entry]}`,
      label: getSeoPageCopy(locale, entry).heading,
    }));
}
