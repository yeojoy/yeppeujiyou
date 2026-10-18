/**
 * yeppeujiyou Hair Salon — Main JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  initNavbar();
  initModal();
  initCopyTemplate();
  initI18n();
});

/* ==========================================================================
   1. Countdown Timer (Target: Nov 17, 2026 10:00:00 AM EST)
   ========================================================================== */
function initCountdown() {
  const targetDate = new Date('2026-11-17T10:00:00-05:00').getTime();

  const daysEl = document.getElementById('count-days');
  const hoursEl = document.getElementById('count-hours');
  const minutesEl = document.getElementById('count-minutes');
  const secondsEl = document.getElementById('count-seconds');

  if (!daysEl) return;

  function update() {
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      const badge = document.getElementById('hero-status-badge');
      if (badge) {
        badge.textContent = '🎉 NOW OPEN! 예약 문의 환영합니다 ♡';
      }
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

/* ==========================================================================
   2. Sticky Glass Navbar
   ========================================================================== */
function initNavbar() {
  const nav = document.querySelector('.glass-nav');
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      nav?.classList.add('scrolled');
    } else {
      nav?.classList.remove('scrolled');
    }
  });

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', !isExpanded);
      mobileMenu.classList.toggle('hidden');
    });

    // Close mobile menu on link click
    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

/* ==========================================================================
   3. Native Dialog Modal (Booking consultation helper)
   ========================================================================== */
function initModal() {
  const modal = document.getElementById('booking-modal');
  const openButtons = document.querySelectorAll('.open-booking-modal');
  const closeBtn = document.getElementById('close-modal-btn');
  const smsBtn = document.getElementById('send-sms-btn');
  const copyBtn = document.getElementById('modal-copy-btn');

  if (!modal) return;

  openButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const prefillService = btn.getAttribute('data-service');
      if (prefillService) {
        const select = document.getElementById('modal-service-select');
        if (select) select.value = prefillService;
      }
      modal.showModal();
    });
  });

  closeBtn?.addEventListener('click', () => modal.close());

  // Light dismiss: click backdrop to close
  modal.addEventListener('click', (e) => {
    const dialogDimensions = modal.getBoundingClientRect();
    if (
      e.clientX < dialogDimensions.left ||
      e.clientX > dialogDimensions.right ||
      e.clientY < dialogDimensions.top ||
      e.clientY > dialogDimensions.bottom
    ) {
      modal.close();
    }
  });

  // Action: Send SMS
  smsBtn?.addEventListener('click', () => {
    const name = document.getElementById('modal-name')?.value.trim() || '고객님';
    const service = document.getElementById('modal-service-select')?.value || '헤어 시술';
    const date = document.getElementById('modal-date')?.value || '상담 후 조율';
    const notes = document.getElementById('modal-notes')?.value.trim() || '없음';

    const message = `[yeppeujiyou 예약 문의]\n- 성함: ${name}\n- 희망 시술: ${service}\n- 희망 일시: ${date}\n- 모발 상태 및 문의: ${notes}`;
    
    // Cross-platform SMS URI (iOS uses &body=, Android uses ?body=)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const separator = isIOS ? '&' : '?';
    const smsUrl = `sms:5149947965${separator}body=${encodeURIComponent(message)}`;

    window.location.href = smsUrl;
    showToast('문자 작성 화면으로 연결되었습니다 ✉️');
  });

  // Action: Copy text
  copyBtn?.addEventListener('click', () => {
    const name = document.getElementById('modal-name')?.value.trim() || '고객님';
    const service = document.getElementById('modal-service-select')?.value || '헤어 시술';
    const date = document.getElementById('modal-date')?.value || '상담 후 조율';
    const notes = document.getElementById('modal-notes')?.value.trim() || '없음';

    const message = `[yeppeujiyou 예약 문의]\n- 성함: ${name}\n- 희망 시술: ${service}\n- 희망 일시: ${date}\n- 모발 상태 및 문의: ${notes}`;

    copyToClipboard(message, '예약 양식이 복사되었습니다! 카카오톡이나 문자에 붙여넣어주세요 ♡');
  });
}

/* ==========================================================================
   4. One-Click Template Copy & Toast
   ========================================================================== */
function initCopyTemplate() {
  const copyButtons = document.querySelectorAll('.copy-template-btn');
  copyButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const template = `[yeppeujiyou 예약 문의]\n- 성함: \n- 연락처: \n- 희망 날짜 및 시간: \n- 희망 시술 (커트/염색/펌/매직): \n- 최근 1년 시술 이력 (탈색/블랙염색/매직 등): \n- 문의사항: `;
      copyToClipboard(template, '예약 양식 템플릿이 복사되었습니다! ♡');
    });
  });

  const copyKakaoButtons = document.querySelectorAll('.copy-kakao-id');
  copyKakaoButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      copyToClipboard('yeppeujiyu', '카카오톡 ID (yeppeujiyu)가 복사되었습니다!');
    });
  });

  const copyPhoneButtons = document.querySelectorAll('.copy-phone-btn');
  copyPhoneButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      copyToClipboard('514-994-7965', '전화번호 (514.994.7965)가 복사되었습니다! 문자 전용');
    });
  });
}

function copyToClipboard(text, successMessage) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMessage);
    }).catch(() => {
      fallbackCopy(text, successMessage);
    });
  } else {
    fallbackCopy(text, successMessage);
  }
}

function fallbackCopy(text, successMessage) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToast(successMessage);
  } catch (err) {
    showToast('클립보드 복사에 실패했습니다.');
  }
  document.body.removeChild(textArea);
}

function showToast(message) {
  let toast = document.getElementById('global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'global-toast';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

/* ==========================================================================
   5. Multilingual i18n (KO, EN, FR)
   ========================================================================== */
const translations = {
  ko: {
    heroBadge: "Opening Soon ♡ 예쁜 당신을 위한 공간",
    grandOpen: "11월 17일 GRAND OPEN",
    heroDesc: "소중한 헤어, 편안한 시간과 함께하세요. 몬트리올에서 만나는 감성 프라이빗 1:1 홈 헤어살롱.",
    btnTextBook: "문자로 예약 문의",
    btnKakaoBook: "카카오톡 문의",
    policyNoCall: "No call / Only text ♥ (시술 중 통화가 어려우니 문자 상담 부탁드립니다)",
    navAbout: "살롱 소개",
    navServices: "시술 안내",
    navHours: "영업 시간",
    navBooking: "예약 방법",
    navFaq: "FAQ",
    brandStory: "'예쁘지요'라는 한국어에 헤어드레서인 \"지유\"의 이름과 합하여 yeppeujiyou가 됐습니다. 고객님만을 위한 헤어로 당신을 예쁘게 만들어 드립니다.",
    serviceTitle: "Signature Services",
    serviceSubtitle: "고객님의 모발과 얼굴형에 맞춘 세심한 1:1 디자인 시술",
    cutTitle: "Hair Cut",
    cutDesc: "트렌디한 감각과 섬세한 테크닉으로 완성하는 여성·남성 맞춤형 디자인 커트",
    colorTitle: "Color",
    colorDesc: "모발 손상을 최소화하는 프리미엄 염모제를 사용한 감성 컬러 & 톤온톤 스타일링",
    permTitle: "Perm",
    permDesc: "자연스러운 볼륨과 손질이 쉬운 웨이브를 선사하는 셋팅·디지털·볼륨 열펌",
    straightTitle: "Straightening",
    straightDesc: "윤기와 찰랑임을 되찾아주는 프리미엄 매직 스트레이트 & 모발 영양 클리닉",
    hoursTitle: "Business Hours & Studio",
    hoursTime: "오전 10:00 ~ 오후 5:00",
    hoursDays: "화요일 ~ 토요일 (Tuesday ~ Saturday)",
    hoursClosed: "일요일 · 월요일 정기 휴무",
    bookingTitle: "Booking & Policy",
    bookingSubtitle: "100% 사전 예약제로 한 분 한 분께 최선을 다합니다."
  },
  en: {
    heroBadge: "Opening Soon ♡ A special space for you",
    grandOpen: "GRAND OPEN on November 17",
    heroDesc: "Cherish your hair with relaxing, private time. A cozy 1:1 private home hair salon in Montreal.",
    btnTextBook: "Text to Book (SMS)",
    btnKakaoBook: "KakaoTalk Booking",
    policyNoCall: "No call / Only text ♥ (Please message us as phone calls cannot be answered during service)",
    navAbout: "About",
    navServices: "Services",
    navHours: "Hours",
    navBooking: "How to Book",
    navFaq: "FAQ",
    brandStory: "'yeppeujiyou' was created by combining the Korean phrase 'Yeppeujiyo' (meaning 'Isn't it pretty?') with hairstylist Jiyu's name. We make you look and feel your most beautiful through personalized hair design.",
    serviceTitle: "Signature Services",
    serviceSubtitle: "Personalized 1:1 tailored hair design suited for your hair texture and style",
    cutTitle: "Hair Cut",
    cutDesc: "Custom design cuts for women and men crafted with delicate technique and trendy touch",
    colorTitle: "Color",
    colorDesc: "Sensory tone-on-tone coloring with minimal damage using premium salon dyes",
    permTitle: "Perm",
    permDesc: "Setting & digital perm delivering natural volume and effortless daily styling",
    straightTitle: "Straightening",
    straightDesc: "Premium magic straightening and deep restorative treatment for smooth, glossy hair",
    hoursTitle: "Business Hours & Studio",
    hoursTime: "10:00 AM ~ 5:00 PM",
    hoursDays: "Tuesday ~ Saturday",
    hoursClosed: "Closed on Sunday & Monday",
    bookingTitle: "Booking & Policy",
    bookingSubtitle: "100% appointment-based to dedicate our full care to each client."
  },
  fr: {
    heroBadge: "Ouverture Bientôt ♡ Un espace pour vous sublimer",
    grandOpen: "GRAND OUVERTURE le 17 Novembre",
    heroDesc: "Prenez soin de vos cheveux dans une ambiance intime et chaleureuse. Salon de coiffure privé à domicile à Montréal.",
    btnTextBook: "Réserver par SMS",
    btnKakaoBook: "KakaoTalk",
    policyNoCall: "Pas d'appel / Texto seulement ♥ (Merci de nous écrire par message texte)",
    navAbout: "À propos",
    navServices: "Services",
    navHours: "Horaires",
    navBooking: "Réservation",
    navFaq: "FAQ",
    brandStory: "« yeppeujiyou » est né de l'expression coréenne « Yeppeujiyo » (« N'est-ce pas joli ? ») associée au prénom de la coiffeuse « Jiyu ». Nous révélons toute votre beauté avec une coiffure conçue sur mesure pour vous.",
    serviceTitle: "Nos Services Signature",
    serviceSubtitle: "Une expérience de coiffure sur mesure et personnalisée 1:1",
    cutTitle: "Coupe de Cheveux",
    cutDesc: "Coupes stylisées sur mesure pour femmes et hommes avec technique soignée",
    colorTitle: "Coloration",
    colorDesc: "Coloration délicate et lumineuse avec produits de qualité supérieure",
    permTitle: "Permanente",
    permDesc: "Permanente digitale et mise en plis pour volume naturel et souplesse",
    straightTitle: "Lissage Magic",
    straightDesc: "Lissage coréen et soins réparateurs profonds pour des cheveux brillants et soyeux",
    hoursTitle: "Horaires & Studio",
    hoursTime: "10h00 à 17h00",
    hoursDays: "Du Mardi au Samedi",
    hoursClosed: "Fermé Dimanche et Lundi",
    bookingTitle: "Réservation & Politique",
    bookingSubtitle: "Sur rendez-vous uniquement pour une attention entièrement dédiée."
  }
};

function initI18n() {
  const langButtons = document.querySelectorAll('.lang-btn');
  
  function setLanguage(lang) {
    if (!translations[lang]) return;
    const t = translations[lang];

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (t[key]) {
        el.textContent = t[key];
      }
    });

    langButtons.forEach((btn) => {
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('bg-white', 'shadow-sm', 'font-semibold', 'text-stone-900');
        btn.classList.remove('text-stone-500');
      } else {
        btn.classList.remove('bg-white', 'shadow-sm', 'font-semibold', 'text-stone-900');
        btn.classList.add('text-stone-500');
      }
    });

    document.documentElement.lang = lang;
  }

  langButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      setLanguage(lang);
    });
  });
}
