const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
const menuClose = document.querySelector("[data-menu-close]");
const mobileLinks = mobileMenu?.querySelectorAll("a") ?? [];

function setMenuState(isOpen) {
  if (!mobileMenu || !menuButton) return;
  mobileMenu.classList.toggle("is-open", isOpen);
  menuButton.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("menu-open", isOpen);
}

function updateHeader() {
  header?.classList.toggle("is-scrolled", window.scrollY > 14);
}

menuButton?.addEventListener("click", () => setMenuState(true));
menuClose?.addEventListener("click", () => setMenuState(false));
mobileLinks.forEach((link) =>
  link.addEventListener("click", () => setMenuState(false)),
);

mobileMenu?.addEventListener("click", (event) => {
  if (event.target === mobileMenu) setMenuState(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenuState(false);
});

window.addEventListener("scroll", updateHeader, { passive: true });
window.addEventListener("resize", () => {
  if (window.innerWidth > 1260) setMenuState(false);
});

updateHeader();

const authorModal = document.querySelector("[data-author-modal]");
const authorModalOpen = document.querySelector("[data-author-modal-open]");
const authorModalCloseButtons = document.querySelectorAll(
  "[data-author-modal-close]",
);

let authorModalLastFocus = null;

function setAuthorModalState(isOpen) {
  if (!authorModal) return;

  authorModal.classList.toggle("is-open", isOpen);
  authorModal.setAttribute("aria-hidden", String(!isOpen));
  document.body.classList.toggle("modal-open", isOpen);

  if (isOpen) {
    authorModalLastFocus = document.activeElement;

    window.setTimeout(() => {
      authorModal.querySelector(".author-modal__close")?.focus();
    }, 100);
  } else {
    authorModalLastFocus?.focus();
  }
}

authorModalOpen?.addEventListener("click", () => {
  setAuthorModalState(true);
});

authorModalCloseButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setAuthorModalState(false);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && authorModal?.classList.contains("is-open")) {
    setAuthorModalState(false);
  }
});

/* =========================================
   FORMATS ACCORDIONS
========================================= */

const formatsAccordions = document.querySelectorAll("[data-formats-accordion]");

formatsAccordions.forEach((formatsAccordion) => {
  const formatCards = Array.from(
    formatsAccordion.querySelectorAll(".format-card"),
  );

  const mobileMedia = window.matchMedia("(max-width: 760px)");

  function setFormatCardState(card, isOpen) {
    const button = card.querySelector(".format-card__toggle");

    card.classList.toggle("is-open", isOpen);

    if (button) {
      button.setAttribute("aria-expanded", String(isOpen));
    }
  }

  function closeAllFormatCards() {
    formatCards.forEach((card) => {
      setFormatCardState(card, false);
    });
  }

  function updateFormatsLayout() {
    if (mobileMedia.matches) {
      const openedCard = formatCards.find((card) =>
        card.classList.contains("is-open"),
      );

      closeAllFormatCards();

      if (openedCard) {
        setFormatCardState(openedCard, true);
      } else if (formatCards[0]) {
        setFormatCardState(formatCards[0], true);
      }

      return;
    }

    formatCards.forEach((card) => {
      setFormatCardState(card, true);
    });
  }

  formatCards.forEach((card) => {
    const button = card.querySelector(".format-card__toggle");

    if (!button) return;

    button.addEventListener("click", () => {
      if (!mobileMedia.matches) return;

      const isCurrentlyOpen = card.classList.contains("is-open");

      closeAllFormatCards();

      if (!isCurrentlyOpen) {
        setFormatCardState(card, true);
      }
    });
  });

  if (typeof mobileMedia.addEventListener === "function") {
    mobileMedia.addEventListener("change", updateFormatsLayout);
  } else {
    mobileMedia.addListener(updateFormatsLayout);
  }

  updateFormatsLayout();
});

/* =========================================
   JOURNEY SCROLL ANIMATION
========================================= */

const journeySection = document.querySelector(".journey");

if (journeySection) {
  const journeyRevealItems = journeySection.querySelectorAll(
    "[data-journey-reveal]",
  );

  const journeySteps = Array.from(
    journeySection.querySelectorAll("[data-journey-step]"),
  );

  const journeyProgress = journeySection.querySelector(
    "[data-journey-progress]",
  );

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.15,
    },
  );

  journeyRevealItems.forEach((item) => {
    revealObserver.observe(item);
  });

  const stepObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-active", entry.isIntersecting);
      });
    },
    {
      rootMargin: "-35% 0px -45% 0px",
      threshold: 0,
    },
  );

  journeySteps.forEach((step) => {
    stepObserver.observe(step);
  });

  function updateJourneyProgress() {
    if (!journeyProgress) return;

    const sectionRect = journeySection.getBoundingClientRect();
    const viewportMiddle = window.innerHeight / 2;

    const travelled = viewportMiddle - sectionRect.top;

    const available = sectionRect.height - window.innerHeight / 2;

    const progress = Math.min(Math.max(travelled / available, 0), 1);

    journeyProgress.style.height = `${progress * 100}%`;
  }

  window.addEventListener("scroll", updateJourneyProgress, {
    passive: true,
  });

  window.addEventListener("resize", updateJourneyProgress);

  updateJourneyProgress();
}

/* =========================================
   REVIEWS CAROUSEL
========================================= */

const reviewsSlider = document.querySelector("[data-reviews-slider]");

if (reviewsSlider) {
  const reviewsTrack = reviewsSlider.querySelector("[data-reviews-track]");

  const reviewCards = Array.from(
    reviewsSlider.querySelectorAll("[data-review-card]"),
  );

  const reviewsPreviousButton = reviewsSlider.querySelector(
    "[data-reviews-prev]",
  );

  const reviewsNextButton = reviewsSlider.querySelector("[data-reviews-next]");

  const reviewsPagination = reviewsSlider.querySelector(
    "[data-reviews-pagination]",
  );

  const reviewsCurrent = reviewsSlider.querySelector("[data-reviews-current]");

  const reviewsTotal = reviewsSlider.querySelector("[data-reviews-total]");

  let reviewsPage = 0;
  let reviewsTouchStart = 0;
  let reviewsTouchEnd = 0;
  let reviewsDots = [];

  function getReviewsPerPage() {
    return window.innerWidth <= 760 ? 1 : 4;
  }

  function getReviewsPageCount() {
    return Math.ceil(reviewCards.length / getReviewsPerPage());
  }

  function formatReviewNumber(number) {
    return String(number).padStart(2, "0");
  }

  function createReviewsPagination() {
    if (!reviewsPagination) return;

    reviewsPagination.innerHTML = "";

    reviewsDots = Array.from({ length: getReviewsPageCount() }, (_, index) => {
      const button = document.createElement("button");

      button.className = "reviews-slider__dot";
      button.type = "button";

      button.setAttribute(
        "aria-label",
        `Перейти до групи відгуків ${index + 1}`,
      );

      button.addEventListener("click", () => {
        goToReviewsPage(index);
      });

      reviewsPagination.append(button);

      return button;
    });
  }

  function goToReviewsPage(index) {
    if (!reviewsTrack || !reviewCards.length) return;

    const pageCount = getReviewsPageCount();

    reviewsPage = (index + pageCount) % pageCount;

    /*
     * На мобільному рухаємося по одній картці.
     * На tablet і desktop — одразу по чотири.
     */
    reviewsTrack.style.transform = `translateX(-${reviewsPage * 100}%)`;

    reviewsDots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === reviewsPage;

      dot.classList.toggle("is-active", isActive);

      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });

    if (reviewsCurrent) {
      reviewsCurrent.textContent = formatReviewNumber(reviewsPage + 1);
    }

    if (reviewsTotal) {
      reviewsTotal.textContent = formatReviewNumber(pageCount);
    }
  }

  function showPreviousReviews() {
    goToReviewsPage(reviewsPage - 1);
  }

  function showNextReviews() {
    goToReviewsPage(reviewsPage + 1);
  }

  reviewsPreviousButton?.addEventListener("click", showPreviousReviews);

  reviewsNextButton?.addEventListener("click", showNextReviews);

  reviewsSlider.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      showPreviousReviews();
    }

    if (event.key === "ArrowRight") {
      showNextReviews();
    }
  });

  reviewsSlider.addEventListener(
    "touchstart",
    (event) => {
      reviewsTouchStart = event.changedTouches[0].clientX;
    },
    {
      passive: true,
    },
  );

  reviewsSlider.addEventListener(
    "touchend",
    (event) => {
      reviewsTouchEnd = event.changedTouches[0].clientX;

      const distance = reviewsTouchStart - reviewsTouchEnd;

      if (Math.abs(distance) < 50) return;

      if (distance > 0) {
        showNextReviews();
      } else {
        showPreviousReviews();
      }
    },
    {
      passive: true,
    },
  );

  let previousReviewsPerPage = getReviewsPerPage();

  window.addEventListener("resize", () => {
    const currentReviewsPerPage = getReviewsPerPage();

    if (currentReviewsPerPage === previousReviewsPerPage) {
      return;
    }

    previousReviewsPerPage = currentReviewsPerPage;

    reviewsPage = 0;

    createReviewsPagination();
    goToReviewsPage(0);
  });

  createReviewsPagination();
  goToReviewsPage(0);
}

/* =========================================
   REVIEW MODAL
========================================= */

const reviewModal = document.querySelector("[data-review-modal]");

if (reviewModal) {
  const reviewModalText = reviewModal.querySelector("[data-review-modal-text]");

  const reviewOpenButtons = document.querySelectorAll("[data-review-open]");

  const reviewCloseButtons = reviewModal.querySelectorAll(
    "[data-review-close]",
  );

  let reviewModalLastFocus = null;

  function setReviewModalState(isOpen) {
    reviewModal.classList.toggle("is-open", isOpen);

    reviewModal.setAttribute("aria-hidden", String(!isOpen));

    document.body.classList.toggle("modal-open", isOpen);

    if (isOpen) {
      reviewModalLastFocus = document.activeElement;

      window.setTimeout(() => {
        reviewModal.querySelector(".review-modal__close")?.focus();
      }, 100);
    } else {
      reviewModalLastFocus?.focus();
    }
  }

  reviewOpenButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest("[data-review-card]");
      const fullReview = card?.dataset.reviewFull;

      if (!fullReview || !reviewModalText) return;

      reviewModalText.textContent = fullReview;

      setReviewModalState(true);
    });
  });

  reviewCloseButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setReviewModalState(false);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && reviewModal.classList.contains("is-open")) {
      setReviewModalState(false);
    }
  });
}
/* =========================================
   GALLERY CAROUSEL
========================================= */

const gallery = document.querySelector("[data-gallery-slider]");

if (gallery) {
  const viewport = gallery.querySelector(".gallery-slider__viewport");

  const track = gallery.querySelector("[data-gallery-track]");

  const slides = Array.from(gallery.querySelectorAll("[data-gallery-slide]"));

  const previousButton = gallery.querySelector("[data-gallery-prev]");

  const nextButton = gallery.querySelector("[data-gallery-next]");

  const currentElement = gallery.querySelector("[data-gallery-current]");

  const totalElement = gallery.querySelector("[data-gallery-total]");

  const pagination = gallery.querySelector("[data-gallery-pagination]");

  let currentIndex = 0;
  let paginationButtons = [];

  let touchStartX = 0;
  let touchStartY = 0;
  let touchCurrentX = 0;
  let touchCurrentY = 0;
  let isTouching = false;

  function isMobile() {
    return window.innerWidth <= 760;
  }

  function getVisibleSlides() {
    if (window.innerWidth <= 760) return 1;
    if (window.innerWidth <= 1180) return 3;

    return 4;
  }

  function getPageCount() {
    if (isMobile()) {
      return slides.length;
    }

    return Math.ceil(slides.length / getVisibleSlides());
  }

  function formatNumber(number) {
    return String(number).padStart(2, "0");
  }

  function normalizeIndex(index) {
    const pageCount = getPageCount();

    if (!pageCount) return 0;

    return (index + pageCount) % pageCount;
  }

  function createPagination() {
    if (!pagination) return;

    pagination.innerHTML = "";
    paginationButtons = [];

    const pageCount = getPageCount();

    for (let index = 0; index < pageCount; index++) {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "gallery-slider__dot";

      button.setAttribute("aria-label", `Перейти до фотографії ${index + 1}`);

      button.addEventListener("click", () => {
        goToSlide(index);
      });

      pagination.append(button);
      paginationButtons.push(button);
    }
  }

  function updateActiveState() {
    slides.forEach((slide, index) => {
      const isActive = isMobile()
        ? index === currentIndex
        : index >= currentIndex * getVisibleSlides() &&
          index < currentIndex * getVisibleSlides() + getVisibleSlides();

      slide.classList.toggle("is-active", isActive);

      slide.setAttribute("aria-hidden", String(!isActive));
    });
  }

  function updatePagination() {
    paginationButtons.forEach((button, index) => {
      const isActive = index === currentIndex;

      button.classList.toggle("is-active", isActive);

      button.setAttribute("aria-current", isActive ? "true" : "false");
    });
  }

  function updateCounter() {
    if (currentElement) {
      currentElement.textContent = formatNumber(currentIndex + 1);
    }

    if (totalElement) {
      totalElement.textContent = formatNumber(getPageCount());
    }
  }

  function updateMobilePosition() {
    if (!track || !viewport || !slides[currentIndex]) {
      return;
    }

    const activeSlide = slides[currentIndex];

    /*
     * Використовуємо фактичну позицію конкретного
     * слайда, а не множення ширини на index.
     * Завдяки цьому похибка не накопичується.
     */
    const slideCenter = activeSlide.offsetLeft + activeSlide.offsetWidth / 2;

    const viewportCenter = viewport.clientWidth / 2;

    const translateX = viewportCenter - slideCenter;

    track.style.transform = `translate3d(${translateX}px, 0, 0)`;
  }

  function updateDesktopPosition() {
    if (!track) return;

    /*
     * На desktop один index означає одну сторінку:
     * 4 фото на великому екрані або 3 на планшеті.
     */
    track.style.transform = `translate3d(-${currentIndex * 100}%, 0, 0)`;
  }

  function updateSlider() {
    currentIndex = normalizeIndex(currentIndex);

    if (isMobile()) {
      updateMobilePosition();
    } else {
      updateDesktopPosition();
    }

    updateActiveState();
    updatePagination();
    updateCounter();
  }

  function goToSlide(index) {
    currentIndex = normalizeIndex(index);
    updateSlider();
  }

  function showNextSlide() {
    goToSlide(currentIndex + 1);
  }

  function showPreviousSlide() {
    goToSlide(currentIndex - 1);
  }

  nextButton?.addEventListener("click", showNextSlide);

  previousButton?.addEventListener("click", showPreviousSlide);

  gallery.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      showPreviousSlide();
    }

    if (event.key === "ArrowRight") {
      showNextSlide();
    }
  });

  /* =========================================
     MOBILE SWIPE
  ========================================= */

  gallery.addEventListener(
    "touchstart",
    (event) => {
      if (!isMobile()) return;

      const touch = event.touches[0];

      touchStartX = touch.clientX;
      touchStartY = touch.clientY;

      touchCurrentX = touchStartX;
      touchCurrentY = touchStartY;

      isTouching = true;
    },
    {
      passive: true,
    },
  );

  gallery.addEventListener(
    "touchmove",
    (event) => {
      if (!isMobile() || !isTouching) return;

      const touch = event.touches[0];

      touchCurrentX = touch.clientX;
      touchCurrentY = touch.clientY;
    },
    {
      passive: true,
    },
  );

  gallery.addEventListener(
    "touchend",
    () => {
      if (!isMobile() || !isTouching) return;

      isTouching = false;

      const deltaX = touchCurrentX - touchStartX;

      const deltaY = touchCurrentY - touchStartY;

      /*
       * Вертикальний або діагональний рух
       * залишаємо для прокрутки сторінки.
       */
      const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY) * 1.25;

      if (!isHorizontalSwipe) return;

      if (Math.abs(deltaX) < 45) return;

      if (deltaX < 0) {
        showNextSlide();
      } else {
        showPreviousSlide();
      }
    },
    {
      passive: true,
    },
  );

  gallery.addEventListener(
    "touchcancel",
    () => {
      isTouching = false;
    },
    {
      passive: true,
    },
  );

  /* =========================================
     RESIZE
  ========================================= */

  let previousPageCount = getPageCount();
  let resizeTimer = null;

  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);

    resizeTimer = window.setTimeout(() => {
      const currentPageCount = getPageCount();

      if (currentPageCount !== previousPageCount) {
        previousPageCount = currentPageCount;

        currentIndex = 0;
        createPagination();
      }

      updateSlider();
    }, 100);
  });

  /*
   * Після завантаження фото їхня реальна ширина
   * та позиція можуть трохи змінитися.
   */
  window.addEventListener("load", () => {
    updateSlider();
  });

  createPagination();
  updateSlider();
}

/* =========================================
   CONTACT FORM
========================================= */

const contactForm = document.querySelector("[data-contact-form]");

if (contactForm) {
  const submitButton = contactForm.querySelector(".contact-form__submit");

  const submitText = contactForm.querySelector("[data-submit-text]");

  const statusElement = contactForm.querySelector("[data-form-status]");

  function getField(name) {
    return contactForm.elements.namedItem(name);
  }

  function setFieldError(name, message = "") {
    const field = getField(name);

    const errorElement = contactForm.querySelector(
      `[data-error-for="${name}"]`,
    );

    const fieldWrapper = field?.closest(".form-field");

    fieldWrapper?.classList.toggle("is-invalid", Boolean(message));

    if (errorElement) {
      errorElement.textContent = message;
    }
  }

  function clearErrors() {
    ["name", "phone", "email", "agreement"].forEach((name) => {
      setFieldError(name);
    });
  }

  function validateForm() {
    clearErrors();

    const name = getField("name")?.value.trim() ?? "";
    const phone = getField("phone")?.value.trim() ?? "";
    const email = getField("email")?.value.trim() ?? "";
    const agreement = getField("agreement")?.checked;

    let isValid = true;

    if (name.length < 2) {
      setFieldError("name", "Вкажіть, будь ласка, ваше ім’я.");

      isValid = false;
    }

    const phoneDigits = phone.replace(/\D/g, "");

    if (phoneDigits.length < 9) {
      setFieldError("phone", "Вкажіть коректний номер телефону.");

      isValid = false;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError("email", "Перевірте правильність email.");

      isValid = false;
    }

    if (!agreement) {
      setFieldError("agreement", "Потрібна згода на обробку даних.");

      isValid = false;
    }

    return isValid;
  }

  function setStatus(type, message) {
    if (!statusElement) return;

    statusElement.className = `contact-form__status is-visible is-${type}`;

    statusElement.textContent = message;
  }

  function setLoading(isLoading) {
    if (submitButton) {
      submitButton.disabled = isLoading;
    }

    if (submitText) {
      submitText.textContent = isLoading ? "Надсилаємо..." : "Надіслати заявку";
    }
  }

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const formData = new FormData(contactForm);

    const payload = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email") || "Не вказано",
      interest: formData.get("interest"),
      message: formData.get("message") || "Без повідомлення",
    };

    setLoading(true);

    if (statusElement) {
      statusElement.className = "contact-form__status";

      statusElement.textContent = "";
    }

    try {
      /*
       * Тут буде адреса вашої серверної функції,
       * яка надсилатиме заявку у Telegram.
       */
      const response = await fetch("/api/send-telegram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      contactForm.reset();

      setStatus(
        "success",
        "Дякуємо! Ваша заявка успішно надіслана. Ми зв’яжемося з вами найближчим часом.",
      );
    } catch (error) {
      console.error("Contact form error:", error);

      setStatus(
        "error",
        "Не вдалося надіслати заявку. Спробуйте ще раз або напишіть нам у Telegram.",
      );
    } finally {
      setLoading(false);
    }
  });

  contactForm.addEventListener("input", (event) => {
    const name = event.target.name;

    if (name) {
      setFieldError(name);
    }
  });
}

/* =========================================
   CURRENT YEAR
========================================= */

document.querySelectorAll("[data-current-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});
document.querySelectorAll("[data-current-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});

/* =========================================
   TRAINING MODAL
========================================= */

const trainingModal = document.querySelector("[data-training-modal]");

if (trainingModal) {
  const trainingOpenButtons = document.querySelectorAll("[data-training-open]");
  const trainingCloseButtons = trainingModal.querySelectorAll(
    "[data-training-close]",
  );

  let trainingModalLastFocus = null;

  function setTrainingModalState(isOpen) {
    trainingModal.classList.toggle("is-open", isOpen);
    trainingModal.setAttribute("aria-hidden", String(!isOpen));
    document.body.classList.toggle("modal-open", isOpen);

    if (isOpen) {
      trainingModalLastFocus = document.activeElement;

      setTimeout(() => {
        trainingModal.querySelector(".review-modal__close")?.focus();
      }, 100);
    } else {
      trainingModalLastFocus?.focus();
    }
  }

  trainingOpenButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setTrainingModalState(true);
    });
  });

  trainingCloseButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setTrainingModalState(false);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && trainingModal.classList.contains("is-open")) {
      setTrainingModalState(false);
    }
  });
}

/* =========================================
   BLOG MODAL
========================================= */

const blogModal = document.querySelector("[data-blog-modal]");

if (blogModal) {
  const blogOpenButtons = document.querySelectorAll("[data-blog-open]");
  const blogCloseButtons = blogModal.querySelectorAll("[data-blog-close]");

  const blogModalCategory = blogModal.querySelector(
    "[data-blog-modal-category]",
  );

  const blogModalTitle = blogModal.querySelector("[data-blog-modal-title]");
  const blogModalText = blogModal.querySelector("[data-blog-modal-text]");

  let blogModalLastFocus = null;

  function setBlogModalState(isOpen) {
    blogModal.classList.toggle("is-open", isOpen);
    blogModal.setAttribute("aria-hidden", String(!isOpen));
    document.body.classList.toggle("modal-open", isOpen);

    if (isOpen) {
      blogModalLastFocus = document.activeElement;

      window.setTimeout(() => {
        blogModal.querySelector(".review-modal__close")?.focus();
      }, 100);
    } else {
      blogModalLastFocus?.focus();
    }
  }

  blogOpenButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest("[data-blog-card]");

      if (!card) return;

      if (blogModalCategory) {
        blogModalCategory.textContent = card.dataset.blogCategory || "Блог";
      }

      if (blogModalTitle) {
        blogModalTitle.textContent = card.dataset.blogTitle || "";
      }

      if (blogModalText) {
        blogModalText.textContent = card.dataset.blogContent || "";
      }

      setBlogModalState(true);
    });
  });

  blogCloseButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setBlogModalState(false);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && blogModal.classList.contains("is-open")) {
      setBlogModalState(false);
    }
  });
}

/* =========================================
   COURSES MODAL
========================================= */

const coursesModal = document.querySelector("[data-courses-modal]");

if (coursesModal) {
  const coursesOpenButtons = document.querySelectorAll("[data-courses-open]");

  const coursesCloseButtons = coursesModal.querySelectorAll(
    "[data-courses-close]",
  );

  let coursesModalLastFocus = null;

  function setCoursesModalState(isOpen) {
    coursesModal.classList.toggle("is-open", isOpen);

    coursesModal.setAttribute("aria-hidden", String(!isOpen));

    document.body.classList.toggle("modal-open", isOpen);

    if (isOpen) {
      coursesModalLastFocus = document.activeElement;

      window.setTimeout(() => {
        coursesModal.querySelector(".review-modal__close")?.focus();
      }, 100);
    } else {
      coursesModalLastFocus?.focus();
    }
  }

  coursesOpenButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setCoursesModalState(true);
    });
  });

  coursesCloseButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setCoursesModalState(false);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && coursesModal.classList.contains("is-open")) {
      setCoursesModalState(false);
    }
  });
}

/* =========================================
   PRACTICES MODAL
========================================= */

const practicesModal = document.querySelector("[data-practices-modal]");

if (practicesModal) {
  const practicesOpenButtons = document.querySelectorAll(
    "[data-practices-open]",
  );

  const practicesCloseButtons = practicesModal.querySelectorAll(
    "[data-practices-close]",
  );

  let practicesModalLastFocus = null;

  function setPracticesModalState(isOpen) {
    practicesModal.classList.toggle("is-open", isOpen);

    practicesModal.setAttribute("aria-hidden", String(!isOpen));

    document.body.classList.toggle("modal-open", isOpen);

    if (isOpen) {
      practicesModalLastFocus = document.activeElement;

      window.setTimeout(() => {
        practicesModal.querySelector(".review-modal__close")?.focus();
      }, 100);
    } else {
      practicesModalLastFocus?.focus();
    }
  }

  practicesOpenButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setPracticesModalState(true);
    });
  });

  practicesCloseButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setPracticesModalState(false);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      practicesModal.classList.contains("is-open")
    ) {
      setPracticesModalState(false);
    }
  });
}

/* =========================================
   SEMINARS MODAL
========================================= */

const seminarsModal = document.querySelector("[data-seminars-modal]");

if (seminarsModal) {
  const seminarsOpenButtons = document.querySelectorAll("[data-seminars-open]");

  const seminarsCloseButtons = seminarsModal.querySelectorAll(
    "[data-seminars-close]",
  );

  let seminarsModalLastFocus = null;

  function setSeminarsModalState(isOpen) {
    seminarsModal.classList.toggle("is-open", isOpen);

    seminarsModal.setAttribute("aria-hidden", String(!isOpen));

    document.body.classList.toggle("modal-open", isOpen);

    if (isOpen) {
      seminarsModalLastFocus = document.activeElement;

      window.setTimeout(() => {
        seminarsModal.querySelector(".review-modal__close")?.focus();
      }, 100);
    } else {
      seminarsModalLastFocus?.focus();
    }
  }

  seminarsOpenButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setSeminarsModalState(true);
    });
  });

  seminarsCloseButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setSeminarsModalState(false);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && seminarsModal.classList.contains("is-open")) {
      setSeminarsModalState(false);
    }
  });
}

const form = document.querySelector("[data-contact-form]");
const statusElement = form.querySelector("[data-form-status]");
const submitButton = form.querySelector(".contact-form__submit");
const submitText = form.querySelector("[data-submit-text]");

const BOT_TOKEN = "8811529566:AAGDCnsH4SOPclUOZ8Ocl-6LJwdBMVh2BSQ";

const CHAT_ID = "6461031424";

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  clearErrors();
  statusElement.textContent = "";

  const formData = new FormData(form);

  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const interest = String(formData.get("interest") || "").trim();
  const message = String(formData.get("message") || "").trim();
  const agreement = formData.get("agreement");

  let hasError = false;

  if (!name) {
    showError("name", "Вкажіть ваше ім’я");
    hasError = true;
  }

  if (!phone) {
    showError("phone", "Вкажіть номер телефону");
    hasError = true;
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError("email", "Вкажіть коректний email");
    hasError = true;
  }

  if (!agreement) {
    showError("agreement", "Потрібна згода на обробку персональних даних");
    hasError = true;
  }

  if (hasError) {
    statusElement.textContent = "Перевірте заповнені поля.";
    return;
  }

  const telegramText = [
    "📩 Нова заявка із сайту",
    "",
    `👤 Ім’я: ${name}`,
    `📞 Телефон: ${phone}`,
    `✉️ Email: ${email || "Не вказано"}`,
    `📌 Цікавить: ${interest || "Не вказано"}`,
    "",
    "💬 Повідомлення:",
    message || "Не вказано",
  ].join("\n");

  submitButton.disabled = true;
  submitText.textContent = "Надсилання...";
  statusElement.textContent = "Надсилаємо заявку...";

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: telegramText,
        }),
      },
    );

    const result = await response.json();

    if (!response.ok || !result.ok) {
      console.error("Telegram error:", result);
      throw new Error(result.description || "Помилка Telegram");
    }

    statusElement.textContent = "Дякуємо! Заявку успішно надіслано.";

    form.reset();
  } catch (error) {
    console.error(error);

    statusElement.textContent =
      "Не вдалося надіслати заявку. Перевірте токен і Chat ID.";
  } finally {
    submitButton.disabled = false;
    submitText.textContent = "Надіслати заявку";
  }
});

function showError(fieldName, message) {
  const errorElement = form.querySelector(`[data-error-for="${fieldName}"]`);

  if (errorElement) {
    errorElement.textContent = message;
  }
}

function clearErrors() {
  form.querySelectorAll("[data-error-for]").forEach((element) => {
    element.textContent = "";
  });
}

/* =========================================
   ЗАПЛАНОВАНІ ПОДІЇ — КАРУСЕЛЬ
========================================= */

const eventsSlider = document.querySelector("[data-events-slider]");

if (eventsSlider) {
  const track = eventsSlider.querySelector("[data-events-track]");

  const slides = Array.from(
    eventsSlider.querySelectorAll("[data-event-slide]"),
  );

  const previousButton = eventsSlider.querySelector("[data-events-prev]");
  const nextButton = eventsSlider.querySelector("[data-events-next]");

  const pagination = eventsSlider.querySelector("[data-events-pagination]");

  const currentElement = eventsSlider.querySelector("[data-events-current]");

  const totalElement = eventsSlider.querySelector("[data-events-total]");

  const mobileMedia = window.matchMedia("(max-width: 760px)");

  let currentPage = 0;
  let paginationButtons = [];
  let touchStartX = 0;
  let touchEndX = 0;

  function getSlidesPerPage() {
    return mobileMedia.matches ? 1 : 3;
  }

  function getPageCount() {
    return Math.ceil(slides.length / getSlidesPerPage());
  }

  function formatNumber(number) {
    return String(number).padStart(2, "0");
  }

  function normalizePage(page) {
    const pageCount = getPageCount();

    if (!pageCount) return 0;

    return (page + pageCount) % pageCount;
  }

  function createPagination() {
    if (!pagination) return;

    pagination.innerHTML = "";
    paginationButtons = [];

    for (let index = 0; index < getPageCount(); index += 1) {
      const button = document.createElement("button");

      button.className = "events-slider__dot";
      button.type = "button";

      button.setAttribute("aria-label", `Перейти до групи подій ${index + 1}`);

      button.addEventListener("click", () => {
        goToPage(index);
      });

      pagination.append(button);
      paginationButtons.push(button);
    }
  }

  function updateSlidesState() {
    const slidesPerPage = getSlidesPerPage();
    const firstVisibleSlide = currentPage * slidesPerPage;
    const lastVisibleSlide = firstVisibleSlide + slidesPerPage;

    slides.forEach((slide, index) => {
      const isVisible = index >= firstVisibleSlide && index < lastVisibleSlide;

      slide.classList.toggle("is-active", isVisible);
      slide.setAttribute("aria-hidden", String(!isVisible));
    });
  }

  function updatePagination() {
    paginationButtons.forEach((button, index) => {
      const isActive = index === currentPage;

      button.classList.toggle("is-active", isActive);

      button.setAttribute("aria-current", isActive ? "true" : "false");
    });
  }

  function updateCounter() {
    if (currentElement) {
      currentElement.textContent = formatNumber(currentPage + 1);
    }

    if (totalElement) {
      totalElement.textContent = formatNumber(getPageCount());
    }
  }

  function updatePosition() {
    if (!track) return;

    track.style.transform = `translate3d(-${currentPage * 100}%, 0, 0)`;
  }

  function updateSlider() {
    currentPage = normalizePage(currentPage);

    updatePosition();
    updateSlidesState();
    updatePagination();
    updateCounter();
  }

  function goToPage(page) {
    currentPage = normalizePage(page);
    updateSlider();
  }

  function showPreviousPage() {
    goToPage(currentPage - 1);
  }

  function showNextPage() {
    goToPage(currentPage + 1);
  }

  previousButton?.addEventListener("click", showPreviousPage);
  nextButton?.addEventListener("click", showNextPage);

  eventsSlider.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      showPreviousPage();
    }

    if (event.key === "ArrowRight") {
      showNextPage();
    }
  });

  eventsSlider.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.changedTouches[0].clientX;
    },
    {
      passive: true,
    },
  );

  eventsSlider.addEventListener(
    "touchend",
    (event) => {
      touchEndX = event.changedTouches[0].clientX;

      const swipeDistance = touchStartX - touchEndX;

      if (Math.abs(swipeDistance) < 50) return;

      if (swipeDistance > 0) {
        showNextPage();
      } else {
        showPreviousPage();
      }
    },
    {
      passive: true,
    },
  );

  function handleLayoutChange() {
    currentPage = 0;
    createPagination();
    updateSlider();
  }

  if (typeof mobileMedia.addEventListener === "function") {
    mobileMedia.addEventListener("change", handleLayoutChange);
  } else {
    mobileMedia.addListener(handleLayoutChange);
  }

  createPagination();
  updateSlider();
}

/* =========================================
   CONTACT MODAL
========================================= */

const contactModal = document.querySelector("[data-contact-modal]");

if (contactModal) {
  const openButtons = document.querySelectorAll("[data-contact-modal-open]");

  const closeButtons = contactModal.querySelectorAll(
    "[data-contact-modal-close]",
  );

  const modalForm = contactModal.querySelector("[data-modal-contact-form]");

  const topicOutput = contactModal.querySelector("[data-contact-modal-topic]");

  const topicInput = contactModal.querySelector(
    "[data-contact-modal-topic-input]",
  );

  const statusElement = contactModal.querySelector("[data-modal-form-status]");

  const submitButton = modalForm?.querySelector(".contact-form__submit");

  const submitText = modalForm?.querySelector("[data-modal-submit-text]");

  let lastFocusedElement = null;

  function openContactModal(topic = "") {
    lastFocusedElement = document.activeElement;

    contactModal.classList.add("is-open");
    contactModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    if (topicOutput) {
      topicOutput.textContent = topic;
    }

    if (topicInput) {
      topicInput.value = topic;
    }

    window.setTimeout(() => {
      modalForm?.elements.namedItem("name")?.focus();
    }, 100);
  }

  function closeContactModal() {
    contactModal.classList.remove("is-open");
    contactModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");

    lastFocusedElement?.focus();
  }

  openButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const topic = button.dataset.contactTopic?.trim() || "";

      openContactModal(topic);
    });
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeContactModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && contactModal.classList.contains("is-open")) {
      closeContactModal();
    }
  });

  function getField(name) {
    return modalForm?.elements.namedItem(name);
  }

  function setFieldError(name, message = "") {
    const field = getField(name);

    const errorElement = contactModal.querySelector(
      `[data-modal-error-for="${name}"]`,
    );

    field
      ?.closest(".form-field")
      ?.classList.toggle("is-invalid", Boolean(message));

    if (errorElement) {
      errorElement.textContent = message;
    }
  }

  function clearErrors() {
    ["name", "phone", "email", "agreement"].forEach((name) => {
      setFieldError(name);
    });
  }

  function validateForm() {
    clearErrors();

    const name = getField("name")?.value.trim() ?? "";
    const phone = getField("phone")?.value.trim() ?? "";
    const email = getField("email")?.value.trim() ?? "";
    const agreement = getField("agreement")?.checked;

    let isValid = true;

    if (name.length < 2) {
      setFieldError("name", "Вкажіть, будь ласка, ваше ім’я.");

      isValid = false;
    }

    if (phone.replace(/\D/g, "").length < 9) {
      setFieldError("phone", "Вкажіть коректний номер телефону.");

      isValid = false;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError("email", "Перевірте правильність email.");

      isValid = false;
    }

    if (!agreement) {
      setFieldError("agreement", "Потрібна згода на обробку даних.");

      isValid = false;
    }

    return isValid;
  }

  function setStatus(type, message) {
    if (!statusElement) return;

    statusElement.className = `contact-form__status is-visible is-${type}`;

    statusElement.textContent = message;
  }

  function setLoading(isLoading) {
    if (submitButton) {
      submitButton.disabled = isLoading;
    }

    if (submitText) {
      submitText.textContent = isLoading ? "Надсилаємо..." : "Надіслати заявку";
    }
  }

  modalForm?.addEventListener("input", (event) => {
    const name = event.target.name;

    if (name) {
      setFieldError(name);
    }
  });

  modalForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const formData = new FormData(modalForm);

    const payload = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email") || "Не вказано",
      interest: formData.get("topic") || "Загальний запит",
      message: formData.get("message") || "Без повідомлення",
    };

    setLoading(true);

    if (statusElement) {
      statusElement.className = "contact-form__status";
      statusElement.textContent = "";
    }

    try {
      const response = await fetch("/api/send-telegram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      modalForm.reset();

      setStatus("success", "Дякуємо! Ваша заявка успішно надіслана.");
    } catch (error) {
      console.error("Modal contact form error:", error);

      setStatus("error", "Не вдалося надіслати заявку. Спробуйте ще раз.");
    } finally {
      setLoading(false);
    }
  });
}
/* =========================================
   PAYMENT MODAL
========================================= */

const paymentModal = document.querySelector("[data-payment-modal]");

if (paymentModal) {
  const paymentOpenButtons = document.querySelectorAll(".pay-btn");

  const paymentCloseButtons = paymentModal.querySelectorAll(
    "[data-payment-close]",
  );

  const paymentCopyButtons = paymentModal.querySelectorAll("[data-copy-value]");

  const paymentCopyAllButton = paymentModal.querySelector(
    "[data-copy-all-payment]",
  );

  let paymentModalLastFocus = null;

  function setPaymentModalState(isOpen) {
    paymentModal.classList.toggle("is-open", isOpen);
    paymentModal.setAttribute("aria-hidden", String(!isOpen));
    document.body.classList.toggle("modal-open", isOpen);

    if (isOpen) {
      paymentModalLastFocus = document.activeElement;

      window.setTimeout(() => {
        paymentModal.querySelector(".review-modal__close")?.focus();
      }, 100);
    } else {
      paymentModalLastFocus?.focus();
    }
  }

  async function copyPaymentText(value) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return;
    }

    const temporaryTextarea = document.createElement("textarea");

    temporaryTextarea.value = value;
    temporaryTextarea.setAttribute("readonly", "");
    temporaryTextarea.style.position = "fixed";
    temporaryTextarea.style.left = "-9999px";
    temporaryTextarea.style.opacity = "0";

    document.body.append(temporaryTextarea);

    temporaryTextarea.select();
    document.execCommand("copy");

    temporaryTextarea.remove();
  }

  function showCopiedState(button, textElement, message) {
    const originalText = textElement.textContent;

    button.classList.add("is-copied");
    textElement.textContent = message;

    window.setTimeout(() => {
      button.classList.remove("is-copied");
      textElement.textContent = originalText;
    }, 1800);
  }

  paymentOpenButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      setPaymentModalState(true);
    });
  });

  paymentCloseButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setPaymentModalState(false);
    });
  });

  paymentCopyButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const value = button.dataset.copyValue;
      const textElement = button.querySelector("[data-copy-text]");

      if (!value || !textElement) return;

      try {
        await copyPaymentText(value);

        showCopiedState(button, textElement, "Скопійовано");
      } catch (error) {
        console.error("Помилка копіювання:", error);
        textElement.textContent = "Помилка";
      }
    });
  });

  paymentCopyAllButton?.addEventListener("click", async () => {
    const textElement = paymentCopyAllButton.querySelector(
      "[data-copy-all-text]",
    );

    if (!textElement) return;

    const paymentDetails = [
      "IBAN: UA593220010000026007370090652",
      "ЄДРПОУ: 2575503528",
      "Отримувач: ФОП Багрій Наталія Володимирівна",
      "Призначення платежу: За послуги",
    ].join("\n");

    try {
      await copyPaymentText(paymentDetails);

      showCopiedState(
        paymentCopyAllButton,
        textElement,
        "Реквізити скопійовано",
      );
    } catch (error) {
      console.error("Помилка копіювання:", error);
      textElement.textContent = "Не вдалося скопіювати";
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && paymentModal.classList.contains("is-open")) {
      setPaymentModalState(false);
    }
  });
}
