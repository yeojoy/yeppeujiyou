/**
 * yeppeujiyou Hair Salon — Main JavaScript
 * Multi-language (KO, EN, FR), Countdown, Reservation Modal & Template Copy
 */

document.addEventListener('DOMContentLoaded', () => {
  initI18n();
  initCountdown();
  initNavbar();
  initModal();
  initCopyTemplate();
});

let currentLang = 'ko';

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
        badge.textContent = translations[currentLang]?.heroNowOpen || '🎉 NOW OPEN!';
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

  smsBtn?.addEventListener('click', () => {
    const t = translations[currentLang] || translations.ko;
    const name = document.getElementById('modal-name')?.value.trim() || t.modalDefaultName;
    const service = document.getElementById('modal-service-select')?.value || t.modalDefaultService;
    const date = document.getElementById('modal-date')?.value.trim() || t.modalDefaultDate;
    const notes = document.getElementById('modal-notes')?.value.trim() || t.modalDefaultNotes;

    const message = t.smsMessageFormat(name, service, date, notes);
    
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const separator = isIOS ? '&' : '?';
    const smsUrl = `sms:5149947965${separator}body=${encodeURIComponent(message)}`;

    window.location.href = smsUrl;
    showToast(t.toastSmsOpened);
  });

  copyBtn?.addEventListener('click', () => {
    const t = translations[currentLang] || translations.ko;
    const name = document.getElementById('modal-name')?.value.trim() || t.modalDefaultName;
    const service = document.getElementById('modal-service-select')?.value || t.modalDefaultService;
    const date = document.getElementById('modal-date')?.value.trim() || t.modalDefaultDate;
    const notes = document.getElementById('modal-notes')?.value.trim() || t.modalDefaultNotes;

    const message = t.smsMessageFormat(name, service, date, notes);
    copyToClipboard(message, t.toastTemplateCopied);
  });
}

/* ==========================================================================
   4. One-Click Template Copy & Toast
   ========================================================================== */
function initCopyTemplate() {
  const copyButtons = document.querySelectorAll('.copy-template-btn');
  copyButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const t = translations[currentLang] || translations.ko;
      copyToClipboard(t.bookingTemplatePlain, t.toastTemplateCopied);
    });
  });

  const copyKakaoButtons = document.querySelectorAll('.copy-kakao-id');
  copyKakaoButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const t = translations[currentLang] || translations.ko;
      copyToClipboard('yeppeujiyu', t.toastKakaoCopied);
    });
  });

  const copyPhoneButtons = document.querySelectorAll('.copy-phone-btn');
  copyPhoneButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const t = translations[currentLang] || translations.ko;
      copyToClipboard('514-994-7965', t.toastPhoneCopied);
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
    showToast('Copy failed.');
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
   5. Multilingual i18n Translations (Korean, English, French)
   ========================================================================== */
const translations = {
  ko: {
    pageTitle: 'yeppeujiyou HAIR SALON (예쁘지유) — 몬트리올 프라이빗 1인 헤어살롱',
    bookingTitle: 'Reservation Guide',
    // Navigation
    navAbout: '살롱 소개',
    navServices: '시술 안내',
    navHours: '영업 시간',
    navBooking: '예약 방법',
    navFaq: 'FAQ',
    btnQuickBook: '예약 문의하기',

    // Hero Section
    heroBadge: 'Opening Soon ♡ 예쁜 당신을 위한 공간',
    grandOpen: '11월 17일 GRAND OPEN',
    heroDesc: '소중한 헤어, 편안한 시간과 함께하세요.<br class="hidden sm:inline"> 고객 한 분 한 분의 아름다움을 찾아드리는 몬트리올 프라이빗 1:1 홈 헤어살롱입니다.',
    countdownTitle: '그랜드 오픈 카운트다운 (2026. 11. 17)',
    countDays: 'Days',
    countHours: 'Hours',
    countMins: 'Mins',
    countSecs: 'Secs',
    btnTextBook: '문자로 예약 문의',
    btnKakaoBook: '카카오톡 문의',
    policyNoCall: 'No call / Only text ♥ (문자 예약제)',
    flyerTagPrivate: '100% 프라이빗 1인 예약제',
    heroNowOpen: '🎉 NOW OPEN! 예약 문의 환영합니다 ♡',

    // About Section
    aboutSubtitle: 'About Our Studio',
    aboutTitle: '예쁜 당신을 위한 공간',
    aboutQuote: '"소중한 헤어, 편안한 시간과 함께하세요."',
    brandStoryTag: 'Brand Name Story',
    brandStory: '거울 속 새로워진 모습을 마주할 때 자연스레 건네게 되는 기분 좋은 한마디 <strong>"예쁘지!"(Yeppeuji!)</strong>, 그리고 그 주인공인 <strong>"당신"(You)</strong>이 만나 <strong>yeppeujiyou(예쁘지유)</strong>라는 이야기가 시작되었습니다.<br class="hidden sm:inline"> 당신이 가장 예뻐지는 순간을 선물하고 싶은 마음, 그리고 마지막엔 그 스타일을 완성해 드리는 헤어드레서 <strong>"지유"</strong>의 이름까지 함께 담겨 있습니다.',
    aboutDesc: '<strong>yeppeujiyou</strong>는 복잡하고 분주한 대형 살롱에서 벗어나,<br class="hidden sm:inline"> 오직 한 분의 고객님께만 온전히 집중하는 <strong>1:1 프라이빗 홈 헤어살롱</strong>입니다.<br><br> 고객님의 모발 상태, 두피 건강, 라이프스타일과 얼굴형을 세심하게 고려하여<br class="hidden sm:inline"> 가장 자연스럽고 예쁜 스타일을 편안한 힐링의 시간과 함께 선사해 드립니다.',
    pillar1Title: '1:1 맞춤 세심한 케어',
    pillar1Desc: '처음 상담부터 샴푸, 시술, 마무리 스타일링까지 디자이너가 고객님 한 분만을 전담하여 꼼꼼하게 진행합니다.',
    pillar2Title: '편안한 프라이빗 공간',
    pillar2Desc: '다른 손님들의 시선 없이 차분하고 아늑한 분위기에서 힐링하듯 헤어 케어를 받으실 수 있는 공간입니다.',
    pillar3Title: '건강한 모발과 두피',
    pillar3Desc: '모발 손상을 최소화하는 엄선된 프리미엄 제품만을 사용하여 시술 후에도 윤기 있고 건강한 결을 유지합니다.',

    // Services Section
    serviceTitle: 'Signature Services',
    serviceMainHeading: '전문적인 1:1 헤어 디자인',
    serviceSubtitle: '포스터에 안내된 4가지 핵심 시술 라인업으로 최상의 만족을 선사합니다.',
    cutTitle: 'Hair Cut',
    cutDesc: '트렌디한 감각과 섬세한 테크닉으로 완성하는 여성·남성 맞춤형 디자인 커트.',
    cutItem1: '여성 디자인 레이어드 / 태슬 컷',
    cutItem2: '남성 댄디 / 가일 컷 & 다운펌',
    cutItem3: '페이스라인 맞춤 앞머리 디자인',
    cutBtn: '커트 상담 문의하기',
    colorTitle: 'Color',
    colorDesc: '모발 손상을 최소화하는 프리미엄 염모제를 사용한 감성 컬러 & 톤온톤 스타일링.',
    colorItem1: '퍼스널 톤 맞춤 전체 염색',
    colorItem2: '깔끔하고 자연스러운 뿌리염색',
    colorItem3: '탈색 및 애쉬/트렌드 컬러링',
    colorBtn: '염색 상담 문의하기',
    permTitle: 'Perm',
    permDesc: '자연스러운 볼륨과 손질이 쉬운 웨이브를 선사하는 셋팅·디지털·볼륨 열펌.',
    permItem1: '우아한 C컬 / S컬 열펌',
    permItem2: '드라이한 듯 자연스러운 셋팅펌',
    permItem3: '뿌리볼륨펌 & 남성 볼륨펌',
    permBtn: '펌 상담 문의하기',
    straightTitle: 'Straightening',
    straightDesc: '윤기와 찰랑임을 되찾아주는 프리미엄 매직 스트레이트 & 모발 영양 클리닉.',
    straightItem1: '차분하고 찰랑이는 매직 스트레이트',
    straightItem2: '끝부분 컬을 살린 볼륨 매직',
    straightItem3: '극손상모 복구 케라틴 케어',
    straightBtn: '매직 상담 문의하기',
    serviceNotice: '* 기장(Short / Medium / Long)과 모발 상태에 따라 시술 시간과 견적이 상이하므로 문자로 사진과 함께 문의해 주시면 친절히 안내해 드립니다.',

    // Hours & Studio Section
    hoursSubtitle: 'Business Hours',
    hoursTitle: '영업 시간 안내',
    hoursDays: '화요일 ~ 토요일 (Tue ~ Sat)',
    hoursTime: '10:00 AM ~ 5:00 PM',
    hoursSunMon: '일요일 · 월요일 (Sun · Mon)',
    hoursClosed: '정기 휴무 (Closed)',
    hoursTip: '💡 100% 예약제로 운영되오니 방문 전 반드시 문자나 카카오톡으로 일정을 예약해 주시기 바랍니다.',
    studioSubtitle: 'Private Studio',
    studioHeading: '몬트리올 프라이빗 살롱 안내',
    studioIntro: '<strong>yeppeujiyou</strong>는 캐나다 몬트리올(Montreal, QC)에 위치한 쾌적하고 조용한 프라이빗 홈 스튜디오입니다.',
    locAddressTitle: '살롱 상세 주소',
    locAddressDesc: '고객님의 프라이버시와 1:1 케어 특성상, <strong>예약 확정 시 상세 주소와 주차 위치</strong>를 문자로 안내해 드립니다.',
    locParkingTitle: '편리한 주차',
    locParkingDesc: '스튜디오 앞 주차 가능하여 자차로 편안하게 방문하실 수 있습니다.',
    locPaymentTitle: '결제 안내',
    locPaymentDesc: 'e-Transfer 및 Cash 결제가 가능합니다.',
    btnGetAddress: '예약 문의 및 주소 안내받기 ♡',

    // Booking & Policy Section
    bookingSubtitle: 'Reservation Guide',
    bookingHeading: '예약 안내 및 문의 방법',
    bookingIntro: '100% 사전 예약제로 한 분 한 분께 최선을 다해 정성을 쏟습니다.',
    policyTag: 'Important Policy',
    policyHeading: 'No call / Only text ♥',
    policyDesc: '시술 중에는 고객님의 머리에 집중하고 소음이 발생하여 <strong>전화 통화 응대가 어렵습니다.</strong><br class="hidden sm:inline"> 모든 예약 및 상담 문의는 <strong>문자 메시지(SMS) 또는 카카오톡</strong>으로 남겨주시면 확인하는 대로 신속하고 친절하게 답변드리겠습니다.',
    step1Title: '양식 작성 & 문자 전송',
    step1Desc: '아래 템플릿을 복사하여 희망 일시와 시술을 문자로 보내주세요.',
    step2Title: '1:1 상담 및 시간 조율',
    step2Desc: '모발 상태와 시술 소요 시간을 고려하여 최적의 시간을 조율합니다.',
    step3Title: '예약 확정 및 방문',
    step3Desc: '상세 주소와 주차 안내를 받으신 후 예약 시간에 방문해 주세요.',
    templateBoxTitle: '간편 예약 문의 템플릿',
    templateBoxDesc: '아래 양식을 복사하여 문자나 카카오톡에 붙여넣으시면 더욱 빠른 상담이 가능합니다.',
    btnCopyTemplate: '📋 양식 전체 복사하기',
    btnSendSmsTemplate: '📱 문자로 템플릿 전송 (514.994.7965)',
    btnCopyKakaoId: '💬 카카오톡 ID 복사 (yeppeujiyu)',
    bookingTemplatePlain: `[yeppeujiyou 예약 문의]\n- 성함: \n- 연락처: \n- 희망 날짜 및 시간: \n- 희망 시술 (커트 / 염색 / 펌 / 매직): \n- 최근 1년 시술 이력 (탈색/블랙염색/매직 등): \n- 모발 상태 및 문의사항: `,

    // FAQ Section
    faqSubtitle: 'Help Center',
    faqHeading: '자주 묻는 질문 (FAQ)',
    faqIntro: 'yeppeujiyou 이용 전 궁금하신 점을 확인해 보세요.',
    faq1Q: '오픈일(11월 17일) 이전에도 사전 예약이 가능한가요?',
    faq1A: '네, 가능합니다! 현재 오픈 기념 사전 예약 접수를 받고 있습니다. 원하시는 오픈 주간(11월 17일 이후) 날짜와 시간을 문자로 남겨주시면 우선적으로 일정을 예약해 드립니다.',
    faq2Q: '전화 통화 대신 문자(SMS)로만 문의해야 하나요?',
    faq2A: '네, 맞습니다. yeppeujiyou는 1인 전담 살롱으로 시술 중에는 고객님께 온전히 집중하기 위해 전화를 받지 않습니다("No call / Only text"). 문자(514.994.7965) 또는 카카오톡(@yeppeujiyu)으로 메시지를 남겨주시면 시술이 끝나는 대로 빠르게 확인하여 답장드립니다.',
    faq3Q: '원하는 헤어스타일 사진을 보내서 상담할 수 있나요?',
    faq3A: '물론입니다! 원하시는 스타일 사진과 현재 고객님의 모발 사진(앞/옆/뒤)을 문자로 함께 첨부해 주시면, 고객님의 얼굴형과 모발 상태에 맞는 정확한 시술 상담과 예상 소요 시간을 안내해 드립니다.',
    faq4Q: '주차 및 동반인 대기 공간이 있나요?',
    faq4A: '스튜디오 바로 앞에 전용 주차 공간이 마련되어 있어 주차가 매우 편리합니다. 1인 프라이빗 살롱이지만 편안한 대기 소파가 준비되어 있어 동반인들까지 편안하게 대기하실 수 있습니다.',
    faq5Q: '결제 수단은 무엇을 이용할 수 있나요?',
    faq5A: '캐나다 현지 은행 e-Transfer 및 현금(Cash) 결제가 가능합니다.',
    faq6Q: '예약 취소 및 일정 변경 정책은 어떻게 되나요?',
    faq6A: '1:1 프라이빗 샵 특성상 고객님 한 분만을 위해 해당 시간대를 비워두므로, 부득이하게 일정을 변경하거나 취소하셔야 할 경우 <strong>최소 24시간 전</strong>에 미리 문자로 연락 부탁드립니다.',

    // Footer
    footerDesc: '예쁜 당신을 위한 공간. 몬트리올 1:1 맞춤형 프라이빗 헤어살롱.<br>소중한 헤어, 편안한 시간과 함께하세요.',
    footerHoursHeading: 'Business Hours',
    footerResHeading: 'Reservations (Text Only)',
    footerRights: '© 2026 yeppeujiyou Hair Salon. All rights reserved.',

    // Modal
    modalHelper: 'Booking Helper',
    modalHeading: 'yeppeujiyou 예약 문의',
    modalPolicy: '<strong>No call / Only text</strong>: 시술 중 통화가 불가하여 문자로 접수됩니다.',
    modalLabelName: '성함',
    modalPlaceholderName: '예: 김지유',
    modalLabelService: '희망 시술',
    modalOptCut: 'Hair Cut (여성/남성 헤어 컷)',
    modalOptColor: 'Color (전체 염색/뿌리염색/탈색)',
    modalOptPerm: 'Perm (셋팅펌/디지털펌/볼륨펌)',
    modalOptStraight: 'Straightening (매직/볼륨매직)',
    modalOptCombo: '복합 시술 (커트 + 펌/염색)',
    modalOptOther: '기타 상담 문의',
    modalLabelDate: '희망 날짜 및 시간',
    modalPlaceholderDate: '예: 11월 18일(수) 오후 2시경',
    modalLabelNotes: '모발 상태 / 최근 시술 이력 / 문의사항',
    modalPlaceholderNotes: '예: 어깨 길이 굵은 모발이며, 6개월 전 염색 이력 있습니다.',
    modalBtnSms: '문자(SMS) 앱으로 전송',
    modalBtnCopy: '양식 복사하기',

    // Mobile Bar
    mobileBarOpen: '11월 17일 GRAND OPEN',
    mobileBarInquiry: '예약 문의 514.994.7965',
    mobileBarBtnSms: '문자 문의',
    mobileBarBtnKakao: '카톡',

    // Helpers & Toasts
    modalDefaultName: '고객님',
    modalDefaultService: '헤어 시술',
    modalDefaultDate: '상담 후 조율',
    modalDefaultNotes: '없음',
    toastSmsOpened: '문자 작성 화면으로 연결되었습니다 ✉️',
    toastTemplateCopied: '예약 양식이 복사되었습니다! 카카오톡이나 문자에 붙여넣어주세요 ♡',
    toastKakaoCopied: '카카오톡 ID (yeppeujiyu)가 복사되었습니다!',
    toastPhoneCopied: '전화번호 (514.994.7965)가 복사되었습니다! 문자 전용',
    smsMessageFormat: (name, service, date, notes) => 
      `[yeppeujiyou 예약 문의]\n- 성함: ${name}\n- 희망 시술: ${service}\n- 희망 일시: ${date}\n- 모발 상태 및 문의: ${notes}`
  },

  en: {
    pageTitle: 'yeppeujiyou HAIR SALON — Montreal 1:1 Private Hair Studio',
    bookingTitle: 'Reservation Guide',
    // Navigation
    navAbout: 'About',
    navServices: 'Services',
    navHours: 'Hours',
    navBooking: 'How to Book',
    navFaq: 'FAQ',
    btnQuickBook: 'Book an Appointment',

    // Hero Section
    heroBadge: 'Opening Soon ♡ A Special Space for You',
    grandOpen: 'GRAND OPEN on November 17',
    heroDesc: 'Cherish your hair with relaxing, private time.<br class="hidden sm:inline"> A cozy 1:1 private home hair studio in Montreal dedicated to bringing out your unique beauty.',
    countdownTitle: 'Grand Opening Countdown (2026. 11. 17)',
    countDays: 'Days',
    countHours: 'Hours',
    countMins: 'Mins',
    countSecs: 'Secs',
    btnTextBook: 'Text to Book (SMS)',
    btnKakaoBook: 'KakaoTalk Booking',
    policyNoCall: 'No call / Only text ♥ (Text-only booking)',
    flyerTagPrivate: '100% Private 1:1 Appointment',
    heroNowOpen: '🎉 NOW OPEN! Inquiries welcome ♡',

    // About Section
    aboutSubtitle: 'About Our Studio',
    aboutTitle: 'A Special Space for You',
    aboutQuote: '"Cherish your hair with relaxing, private time."',
    brandStoryTag: 'Brand Name Story',
    brandStory: 'When you look in the mirror and see your transformed style, a warm smile and the confident Korean phrase <strong>"Yeppeuji!" ("So pretty!")</strong> naturally follow—combined with <strong>"You,"</strong> the star of that moment, to create the story of <strong>yeppeujiyou</strong>.<br class="hidden sm:inline"> Above all, tucked right at the end of the name is also hairstylist <strong>"Jiyu,"</strong> who brings your most beautiful look to life.',
    aboutDesc: 'Stepping away from the rush of crowded commercial salons, <strong>yeppeujiyou</strong> is an intimate <strong>1:1 private home hair studio</strong> fully focused on one guest at a time.<br><br> We carefully assess your hair condition, scalp wellness, lifestyle, and facial contours to deliver the most natural, radiant style alongside a truly peaceful and restorative experience.',
    pillar1Title: 'Tailored 1:1 Attentive Care',
    pillar1Desc: 'From initial consultation to shampoo, treatment, and final styling, your stylist personally handles every step with meticulous attention.',
    pillar2Title: 'Relaxing Private Atmosphere',
    pillar2Desc: 'Enjoy your hair care in a calm, cozy atmosphere free from the distractions and gazes of a crowded salon.',
    pillar3Title: 'Healthy Hair & Scalp',
    pillar3Desc: 'We use only carefully selected premium products that minimize damage, leaving your hair glossy, resilient, and healthy.',

    // Services Section
    serviceTitle: 'Signature Services',
    serviceMainHeading: 'Professional 1:1 Hair Design',
    serviceSubtitle: 'Offering top satisfaction through the 4 core service lines showcased on our flyer.',
    cutTitle: 'Hair Cut',
    cutDesc: 'Custom design cuts for women and men crafted with delicate technique and trendy touch.',
    cutItem1: 'Women\'s layered, tassel, or precision cuts',
    cutItem2: 'Men\'s dandy cut, fade & down perm',
    cutItem3: 'Face-framing bangs & fringe design',
    cutBtn: 'Inquire for Hair Cut',
    colorTitle: 'Color',
    colorDesc: 'Sensory tone-on-tone coloring with minimal damage using premium salon dyes.',
    colorItem1: 'Full color matched to your skin tone',
    colorItem2: 'Seamless root touch-up',
    colorItem3: 'Bleach, balayage & trend tone coloring',
    colorBtn: 'Inquire for Color',
    permTitle: 'Perm',
    permDesc: 'Setting & digital heat perms delivering natural volume and effortless daily styling.',
    permItem1: 'Elegant C-curl & S-curl heat perms',
    permItem2: 'Blowout-look setting perm',
    permItem3: 'Root volume perm & men\'s volume perm',
    permBtn: 'Inquire for Perm',
    straightTitle: 'Straightening',
    straightDesc: 'Premium magic straightening and deep restorative treatment for smooth, glossy hair.',
    straightItem1: 'Silky, frizz-free magic straightening',
    straightItem2: 'Volume magic with soft curved ends',
    straightItem3: 'Damaged hair keratin recovery clinic',
    straightBtn: 'Inquire for Straightening',
    serviceNotice: '* Duration and pricing vary based on hair length (Short / Medium / Long) and condition. Please message us with reference photos for a personalized estimate.',

    // Hours & Studio Section
    hoursSubtitle: 'Business Hours',
    hoursTitle: 'Business Hours & Studio',
    hoursDays: 'Tuesday ~ Saturday',
    hoursTime: '10:00 AM ~ 5:00 PM',
    hoursSunMon: 'Sunday & Monday',
    hoursClosed: 'Closed',
    hoursTip: '💡 As we operate strictly on a 100% reservation basis, please make sure to book your appointment via SMS or KakaoTalk before visiting.',
    studioSubtitle: 'Private Studio',
    studioHeading: 'Montreal Private Studio Info',
    studioIntro: '<strong>yeppeujiyou</strong> is a serene, comfortable private home hair studio located in Montreal, Quebec, Canada.',
    locAddressTitle: 'Detailed Address',
    locAddressDesc: 'For guest privacy and tailored 1:1 service, our <strong>exact street address and parking details</strong> are sent via text message once your booking is confirmed.',
    locParkingTitle: 'Easy Parking',
    locParkingDesc: 'Dedicated parking space is available right in front of the studio for your convenience.',
    locPaymentTitle: 'Payment Methods',
    locPaymentDesc: 'We accept Canadian e-Transfer and Cash.',
    btnGetAddress: 'Inquire & Receive Address Details ♡',

    // Booking & Policy Section
    bookingSubtitle: 'Reservation Guide',
    bookingHeading: 'How to Book & Reservation Policy',
    bookingIntro: 'We operate 100% by advance reservation to give our full heart and care to every single guest.',
    policyTag: 'Important Policy',
    policyHeading: 'No call / Only text ♥',
    policyDesc: 'During appointments, we are fully devoted to our guest\'s hair, and hair tools create background noise, making it <strong>difficult to take phone calls.</strong><br class="hidden sm:inline"> Please send all booking inquiries via <strong>text message (SMS) or KakaoTalk</strong>. We will reply promptly and warmly as soon as we finish the service.',
    step1Title: '1. Fill & Send Message',
    step1Desc: 'Copy the template below and text us your preferred date, time, and service.',
    step2Title: '2. 1:1 Consultation & Schedule',
    step2Desc: 'We consult on your hair condition and coordinate the optimal appointment time.',
    step3Title: '3. Confirmed & Visit',
    step3Desc: 'Receive the studio address and parking guidance, then visit us at your booked time!',
    templateBoxTitle: 'Quick Booking Template',
    templateBoxDesc: 'Copy the form below and paste it into your SMS or KakaoTalk message for faster service.',
    btnCopyTemplate: '📋 Copy Full Template',
    btnSendSmsTemplate: '📱 Send via SMS (514.994.7965)',
    btnCopyKakaoId: '💬 Copy KakaoTalk ID (yeppeujiyu)',
    bookingTemplatePlain: `[yeppeujiyou Booking Inquiry]\n- Name: \n- Phone Number: \n- Preferred Date & Time: \n- Desired Service (Cut / Color / Perm / Straightening): \n- Chemical treatments in past year (Bleach / Black dye / Perm / Relaxer): \n- Questions / Hair condition: `,

    // FAQ Section
    faqSubtitle: 'Help Center',
    faqHeading: 'Frequently Asked Questions (FAQ)',
    faqIntro: 'Everything you need to know before visiting yeppeujiyou.',
    faq1Q: 'Can I make an advance booking before the Grand Opening on November 17?',
    faq1A: 'Yes, absolutely! We are currently taking advance bookings for our opening period. Please send us your desired date and time (from November 17 onwards) via text message, and we will prioritize your schedule.',
    faq2Q: 'Do I have to message via text (SMS) instead of calling?',
    faq2A: 'Yes, that is correct. yeppeujiyou is a dedicated 1:1 salon, so we do not answer phone calls during services to maintain 100% focus on our clients ("No call / Only text"). If you message us at 514.994.7965 or on KakaoTalk (@yeppeujiyu), we will reply promptly as soon as the service finishes.',
    faq3Q: 'Can I send photos of my desired hairstyle for consultation?',
    faq3A: 'Absolutely! Please text us reference photos of the style you want, along with photos of your current hair (front/side/back). We will evaluate your hair condition and facial shape to provide an accurate consultation and estimated duration.',
    faq4Q: 'Is parking available, and can accompanying guests wait?',
    faq4A: 'There is dedicated parking space right in front of the studio for easy access. While it is a private 1:1 studio, a comfortable waiting sofa is available so accompanying guests can relax comfortably as well.',
    faq5Q: 'What payment methods are accepted?',
    faq5A: 'We accept Canadian e-Transfer and Cash.',
    faq6Q: 'What is the policy for cancellation and rescheduling?',
    faq6A: 'Because our 1:1 studio reserves the entire time slot exclusively for you, please notify us by text <strong>at least 24 hours in advance</strong> if you need to reschedule or cancel.',

    // Footer
    footerDesc: 'A special space for you. Montreal 1:1 private home hair studio.<br>Cherish your hair with relaxing, private time.',
    footerHoursHeading: 'Business Hours',
    footerResHeading: 'Reservations (Text Only)',
    footerRights: '© 2026 yeppeujiyou Hair Salon. All rights reserved.',

    // Modal
    modalHelper: 'Booking Helper',
    modalHeading: 'yeppeujiyou Booking Inquiry',
    modalPolicy: '<strong>No call / Only text</strong>: Phone calls cannot be answered during service; bookings are handled via text message.',
    modalLabelName: 'Full Name',
    modalPlaceholderName: 'e.g. Jiyu Kim',
    modalLabelService: 'Desired Service',
    modalOptCut: 'Hair Cut (Women / Men Hair Cut)',
    modalOptColor: 'Color (Full Color / Root Touch-up / Bleach)',
    modalOptPerm: 'Perm (Setting / Digital / Volume Perm)',
    modalOptStraight: 'Straightening (Magic Straight / Volume Magic)',
    modalOptCombo: 'Combo (Cut + Perm/Color)',
    modalOptOther: 'Other Consultation',
    modalLabelDate: 'Preferred Date & Time',
    modalPlaceholderDate: 'e.g. Nov 18 (Wed) around 2:00 PM',
    modalLabelNotes: 'Hair Condition / Chemical History / Notes',
    modalPlaceholderNotes: 'e.g. Shoulder length thick hair, colored 6 months ago.',
    modalBtnSms: 'Send via SMS App',
    modalBtnCopy: 'Copy Message Template',

    // Mobile Bar
    mobileBarOpen: 'GRAND OPEN NOV 17',
    mobileBarInquiry: 'Book: 514.994.7965',
    mobileBarBtnSms: 'Text SMS',
    mobileBarBtnKakao: 'Kakao',

    // Helpers & Toasts
    modalDefaultName: 'Client',
    modalDefaultService: 'Hair Service',
    modalDefaultDate: 'To be scheduled',
    modalDefaultNotes: 'None',
    toastSmsOpened: 'SMS app opened with consultation message ✉️',
    toastTemplateCopied: 'Booking template copied! Please paste it into your SMS or KakaoTalk ♡',
    toastKakaoCopied: 'KakaoTalk ID (yeppeujiyu) copied!',
    toastPhoneCopied: 'Phone number (514.994.7965) copied! Text only',
    smsMessageFormat: (name, service, date, notes) => 
      `[yeppeujiyou Booking Inquiry]\n- Name: ${name}\n- Service: ${service}\n- Preferred Date/Time: ${date}\n- Hair notes: ${notes}`
  },

  fr: {
    pageTitle: 'yeppeujiyou HAIR SALON — Salon de coiffure privé à domicile à Montréal',
    bookingTitle: 'Guide de réservation',
    // Navigation
    navAbout: 'À propos',
    navServices: 'Services',
    navHours: 'Horaires',
    navBooking: 'Réservation',
    navFaq: 'FAQ',
    btnQuickBook: 'Prendre rendez-vous',

    // Hero Section
    heroBadge: 'Ouverture Bientôt ♡ Un espace pour vous sublimer',
    grandOpen: 'GRANDE OUVERTURE le 17 Novembre',
    heroDesc: 'Prenez soin de vos cheveux dans une ambiance intime et chaleureuse.<br class="hidden sm:inline"> Salon de coiffure privé à domicile 1:1 à Montréal, dédié à révéler votre beauté unique.',
    countdownTitle: 'Compte à rebours de l\'ouverture (2026. 11. 17)',
    countDays: 'Jours',
    countHours: 'Heures',
    countMins: 'Mins',
    countSecs: 'Secs',
    btnTextBook: 'Réserver par SMS',
    btnKakaoBook: 'KakaoTalk',
    policyNoCall: 'Pas d\'appel / Texto seulement ♥ (Réservation par texto)',
    flyerTagPrivate: '100% Privé sur rendez-vous 1:1',
    heroNowOpen: '🎉 MAINTENANT OUVERT ! Bienvenue ♡',

    // About Section
    aboutSubtitle: 'À propos de notre studio',
    aboutTitle: 'Un espace pour vous sublimer',
    aboutQuote: '« Prenez soin de vos cheveux dans une ambiance intime et chaleureuse. »',
    brandStoryTag: 'L\'Histoire du nom',
    brandStory: 'En découvrant votre nouveau style dans le miroir, une douce exclamation en coréen vient naturellement aux lèvres : <strong>« Yeppeuji ! » (« Comme c\'est joli ! »)</strong>, qui s\'unit à <strong>« You » (Vous)</strong> pour écrire l\'histoire de <strong>yeppeujiyou</strong>.<br class="hidden sm:inline"> Et tout à la fin de ce nom se cache aussi le prénom de votre coiffeuse, <strong>« Jiyu »</strong>, qui révèle votre beauté avec soin.',
    aboutDesc: 'Loin de l\'agitation des grands salons commerciaux, <strong>yeppeujiyou</strong> est un <strong>salon de coiffure privé à domicile 1:1</strong> entièrement dédié à une seule cliente à la fois.<br><br> Nous prenons soin d\'analyser la texture de vos cheveux, la santé de votre cuir chevelu, votre style de vie et vos traits pour créer une coiffure naturelle et élégante, tout en vous offrant un véritable moment de détente.',
    pillar1Title: 'Soins personnalisés et attentifs 1:1',
    pillar1Desc: 'De la consultation initiale au shampoing, en passant par le traitement et la finition, votre styliste s\'occupe de vous personnellement du début à la fin.',
    pillar2Title: 'Espace privé et apaisant',
    pillar2Desc: 'Profitez de vos soins capillaires dans une atmosphère paisible et chaleureuse, à l\'abri des regards et du bruit des salons traditionnels.',
    pillar3Title: 'Cheveux et cuir chevelu sains',
    pillar3Desc: 'Nous utilisons exclusivement des produits haut de gamme rigoureusement sélectionnés pour minimiser les dommages et préserver la vitalité de vos cheveux.',

    // Services Section
    serviceTitle: 'Nos Services Signature',
    serviceMainHeading: 'Créations capillaires professionnelles 1:1',
    serviceSubtitle: 'Une satisfaction garantie à travers les 4 catégories de soins présentées sur notre affiche.',
    cutTitle: 'Coupe de Cheveux',
    cutDesc: 'Coupes stylisées sur mesure pour femmes et hommes avec technique soignée et sens du détail.',
    cutItem1: 'Coupes dégradées, effilées ou structurées pour femmes',
    cutItem2: 'Coupes dandy pour hommes, dégradés & down perm',
    cutItem3: 'Franges et contours du visage sur mesure',
    cutBtn: 'Demander pour une Coupe',
    colorTitle: 'Coloration',
    colorDesc: 'Coloration délicate et lumineuse avec produits de qualité supérieure pour préserver la fibre capillaire.',
    colorItem1: 'Coloration complète adaptée à votre carnation',
    colorItem2: 'Retouche de racines naturelle et soignée',
    colorItem3: 'Décoloration, balayage et nuances tendance',
    colorBtn: 'Demander pour une Coloration',
    permTitle: 'Permanente',
    permDesc: 'Permanentes digitales et thermiques offrant un volume naturel et un coiffage facile au quotidien.',
    permItem1: 'Permanentes chauffantes élégantes en boucles C & S',
    permItem2: 'Permanente mise en plis à l\'effet brushing naturel',
    permItem3: 'Permanente volume racine & permanente homme',
    permBtn: 'Demander pour une Permanente',
    straightTitle: 'Lissage Magic',
    straightDesc: 'Lissage coréen magic et soins réparateurs profonds pour des cheveux brillants et soyeux.',
    straightItem1: 'Lissage magic soyeux et anti-frisottis durable',
    straightItem2: 'Lissage volume avec pointes souples et naturelles',
    straightItem3: 'Soin botox / kératine régénérant pour cheveux abîmés',
    straightBtn: 'Demander pour un Lissage',
    serviceNotice: '* La durée et les tarifs varient selon la longueur (Court / Mi-long / Long) et l\'état des cheveux. Envoyez-nous un texto avec une photo pour une estimation personnalisée.',

    // Hours & Studio Section
    hoursSubtitle: 'Horaires d\'ouverture',
    hoursTitle: 'Horaires d\'ouverture & Studio',
    hoursDays: 'Du Mardi au Samedi',
    hoursTime: '10h00 à 17h00',
    hoursSunMon: 'Dimanche et Lundi',
    hoursClosed: 'Fermé',
    hoursTip: '💡 Le studio fonctionne 100% sur rendez-vous. Merci de réserver votre plage horaire par texto ou KakaoTalk avant de vous déplacer.',
    studioSubtitle: 'Studio Privé',
    studioHeading: 'Informations sur le Studio à Montréal',
    studioIntro: '<strong>yeppeujiyou</strong> est un studio de coiffure privé à domicile, agréable et paisible, situé à Montréal, Québec, Canada.',
    locAddressTitle: 'Adresse du salon',
    locAddressDesc: 'Pour préserver votre intimité et assurer un service 1:1 sur mesure, <strong>l\'adresse exacte et les indications de stationnement</strong> vous sont transmises par texto dès confirmation du rendez-vous.',
    locParkingTitle: 'Stationnement facile',
    locParkingDesc: 'Un espace de stationnement est disponible juste devant le studio pour vous accueillir en toute tranquillité.',
    locPaymentTitle: 'Moyens de paiement',
    locPaymentDesc: 'Nous acceptons les virements électroniques (e-Transfer) et les paiements en argent comptant (Cash).',
    btnGetAddress: 'Réserver et obtenir l\'adresse ♡',

    // Booking & Policy Section
    bookingSubtitle: 'Guide de réservation',
    bookingHeading: 'Comment réserver & Politiques',
    bookingIntro: '100% sur rendez-vous préalable pour consacrer toute notre attention et notre savoir-faire à chaque cliente.',
    policyTag: 'Règle Importante',
    policyHeading: 'Pas d\'appel / Texto seulement ♥',
    policyDesc: 'Pendant les soins, nous sommes entièrement concentrés sur nos clientes et le bruit des appareils de coiffure <strong>ne permet pas de répondre aux appels téléphoniques.</strong><br class="hidden sm:inline"> Merci de soumettre toutes vos demandes par <strong>message texte (SMS) ou KakaoTalk</strong>. Nous vous répondrons avec grand plaisir dès la fin de notre prestation.',
    step1Title: '1. Remplir & Envoyer un texto',
    step1Desc: 'Copiez le formulaire ci-dessous et envoyez-nous par texto vos disponibilités et le service souhaité.',
    step2Title: '2. Consultation 1:1 & Horaire',
    step2Desc: 'Nous échangeons sur l\'état de vos cheveux et convenons ensemble du meilleur moment pour vous recevoir.',
    step3Title: '3. Confirmation & Visite',
    step3Desc: 'Recevez l\'adresse exacte et les indications d\'accès, puis venez vous faire chouchouter à l\'heure convenue !',
    templateBoxTitle: 'Formulaire rapide de réservation',
    templateBoxDesc: 'Copiez ce modèle et collez-le dans votre texto ou message KakaoTalk pour une prise en charge accélérée.',
    btnCopyTemplate: '📋 Copier tout le formulaire',
    btnSendSmsTemplate: '📱 Envoyer par SMS (514.994.7965)',
    btnCopyKakaoId: '💬 Copier l\'ID KakaoTalk (yeppeujiyu)',
    bookingTemplatePlain: `[yeppeujiyou Demande de Réservation]\n- Nom: \n- Téléphone: \n- Date et heure souhaitées: \n- Service désiré (Coupe / Coloration / Permanente / Lissage): \n- Traitements chimiques depuis 1 an (Décoloration / Teinture noire / Défrisage): \n- Questions / État des cheveux: `,

    // FAQ Section
    faqSubtitle: 'Centre d\'aide',
    faqHeading: 'Foire aux questions (FAQ)',
    faqIntro: 'Tout ce que vous devez savoir avant votre visite chez yeppeujiyou.',
    faq1Q: 'Est-il possible de réserver à l\'avance avant l\'ouverture officielle le 17 novembre ?',
    faq1A: 'Oui, tout à fait ! Nous prenons dès maintenant les pré-réservations pour notre période d\'ouverture. Envoyez-nous la date et l\'heure souhaitées (à partir du 17 novembre) par texto, et nous planifierons votre rendez-vous en priorité.',
    faq2Q: 'Dois-je obligatoirement envoyer un message texte au lieu d\'appeler ?',
    faq2A: 'Oui, exactement. yeppeujiyou étant un salon individuel 1:1, nous ne répondons pas aux appels téléphoniques pendant les soins afin de nous consacrer entièrement à notre cliente (« Pas d\'appel / Texto seulement »). En nous écrivant au 514.994.7965 ou sur KakaoTalk (@yeppeujiyu), nous vous répondrons sans faute dès la fin de notre prestation.',
    faq3Q: 'Puis-je envoyer des photos du style souhaité pour une consultation ?',
    faq3A: 'Absolument ! N\'hésitez pas à nous envoyer par texto des photos du style qui vous inspire, accompagnées de photos de vos cheveux actuels (face/profil/arrière). Nous analyserons l\'état de vos cheveux et votre morphologie pour vous conseiller précisément.',
    faq4Q: 'Le stationnement est-il disponible et des accompagnateurs peuvent-ils attendre sur place ?',
    faq4A: 'Un stationnement privé est disponible juste devant le studio. Bien qu\'il s\'agisse d\'un salon intime 1:1, un canapé confortable est prévu pour que vos accompagnateurs puissent également patienter en toute tranquillité.',
    faq5Q: 'Quels sont les modes de paiement acceptés ?',
    faq5A: 'Nous acceptons les virements électroniques (e-Transfer) et les paiements en argent comptant (Cash).',
    faq6Q: 'Quelle est la politique d\'annulation et de modification ?',
    faq6A: 'Comme notre studio 1:1 réserve l\'intégralité du créneau horaire exclusivement pour vous, nous vous prions de nous aviser par texto <strong>au moins 24 heures à l\'avance</strong> pour toute annulation ou modification.',

    // Footer
    footerDesc: 'Un espace pour vous sublimer. Salon de coiffure privé à domicile 1:1 à Montréal.<br>Prenez soin de vos cheveux dans une ambiance intime et chaleureuse.',
    footerHoursHeading: 'Horaires',
    footerResHeading: 'Réservations (Texto seulement)',
    footerRights: '© 2026 Salon de coiffure yeppeujiyou. Tous droits réservés.',

    // Modal
    modalHelper: 'Aide à la réservation',
    modalHeading: 'Demande de réservation yeppeujiyou',
    modalPolicy: '<strong>Pas d\'appel / Texto seulement</strong>: Ne pouvant répondre au téléphone en cours de prestation, les demandes sont reçues par texto.',
    modalLabelName: 'Nom complet',
    modalPlaceholderName: 'ex: Sophie Tremblay',
    modalLabelService: 'Service souhaité',
    modalOptCut: 'Coupe de cheveux (Femme / Homme)',
    modalOptColor: 'Coloration (Complète / Racines / Décoloration)',
    modalOptPerm: 'Permanente (Mise en plis / Digitale / Volume)',
    modalOptStraight: 'Lissage (Lissage Magic / Volume)',
    modalOptCombo: 'Forfait combiné (Coupe + Permanente/Couleur)',
    modalOptOther: 'Autre demande / Consultation',
    modalLabelDate: 'Date et heure souhaitées',
    modalPlaceholderDate: 'ex: 18 nov. (Mer) vers 14h00',
    modalLabelNotes: 'État des cheveux / Historique chimique / Remarques',
    modalPlaceholderNotes: 'ex: Cheveux épais mi-longs, colorés il y a 6 mois.',
    modalBtnSms: 'Envoyer par SMS',
    modalBtnCopy: 'Copier le message',

    // Mobile Bar
    mobileBarOpen: 'OUVERTURE 17 NOV',
    mobileBarInquiry: 'Réserver: 514.994.7965',
    mobileBarBtnSms: 'Texto',
    mobileBarBtnKakao: 'Kakao',

    // Helpers & Toasts
    modalDefaultName: 'Cliente',
    modalDefaultService: 'Coiffure',
    modalDefaultDate: 'À convenir',
    modalDefaultNotes: 'Aucun',
    toastSmsOpened: 'Application SMS ouverte avec votre message ✉️',
    toastTemplateCopied: 'Modèle copié ! Veuillez le coller dans votre texto ou message KakaoTalk ♡',
    toastKakaoCopied: 'ID KakaoTalk (yeppeujiyu) copié !',
    toastPhoneCopied: 'Numéro de téléphone (514.994.7965) copié ! Texto seulement',
    smsMessageFormat: (name, service, date, notes) => 
      `[yeppeujiyou Demande de Réservation]\n- Nom: ${name}\n- Service: ${service}\n- Date/Heure souhaitées: ${date}\n- Remarques/Cheveux: ${notes}`
  }
};

function initI18n() {
  const langButtons = document.querySelectorAll('.lang-btn');
  const STORAGE_KEY = 'yeppeujiyou_lang';
  
  function setLanguage(lang, persist = true) {
    if (!translations[lang]) return;
    currentLang = lang;

    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch (e) {
        // Handle restricted storage environments
      }
    }

    const t = translations[lang];

    // 1. Text elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (t[key] !== undefined) {
        if (el.tagName === 'TITLE') {
          document.title = t[key];
        } else if (t[key].includes('<') && t[key].includes('>')) {
          el.innerHTML = t[key];
        } else {
          el.textContent = t[key];
        }
      }
    });

    // 2. Input/Textarea placeholders with data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (t[key] !== undefined) {
        el.setAttribute('placeholder', t[key]);
      }
    });

    // 3. Update preformatted booking template code block
    const codeEl = document.getElementById('booking-template-code');
    if (codeEl && t.bookingTemplatePlain) {
      codeEl.textContent = t.bookingTemplatePlain;
    }

    // 4. Update language switcher buttons active styles
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
      setLanguage(lang, true);
    });
  });

  // Resolve initial language on page load / refresh:
  // 1. URL parameter (?lang=en, ?lang=fr, ?lang=ko)
  // 2. Saved user preference in localStorage
  // 3. Default fallback to 'ko'
  let initialLang = 'ko';
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang && translations[urlLang]) {
      initialLang = urlLang;
      try {
        localStorage.setItem(STORAGE_KEY, urlLang);
      } catch (e) {}
    } else {
      const savedLang = localStorage.getItem(STORAGE_KEY);
      if (savedLang && translations[savedLang]) {
        initialLang = savedLang;
      }
    }
  } catch (e) {
    // Keep fallback on restricted storage
  }

  // Apply initial language (without re-persisting)
  setLanguage(initialLang, false);
}
