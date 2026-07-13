export interface ContactInfo {
  phone: string;
  whatsapp: string;
  email: string;
}

export const WHATSAPP_NUMBER = "+905441772249";
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER.replace("+", "")}`;
export const INSTAGRAM_LINK = "https://instagram.com/alicutzzzz";
export const CONTACT_EMAIL = "97alicutzzzz@gmail.com";
export const CONTACT_EMAIL_LINK = `mailto:${CONTACT_EMAIL}`;

export const CONTACT_INFO: ContactInfo = {
  phone: "+90 544 177 22 49",
  whatsapp: "+90 544 177 22 49",
  email: CONTACT_EMAIL,
};

export const HOME_LOCALE_CODES = ["tr", "en", "ar", "de", "fa", "ru"] as const;
