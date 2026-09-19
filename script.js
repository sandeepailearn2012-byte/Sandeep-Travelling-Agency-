/* =====================================================
   Sandeep Travelling Agency – script.js
   ===================================================== */

/* ---------------------------------------------------
   ✏️ सिर्फ़ इसी हिस्से में अपनी जानकारी डालें
   - नंबर 10 अंकों का हो, बिना +91, बिना space
   - खाली ("") छोड़ेंगे तो website पर [ADD YOUR ...] ही दिखेगा
--------------------------------------------------- */
const SETTINGS = {
  phone: "",      // Call 8896380565
  whatsapp: "",   // WhatsApp वाला नंबर (8896380565)
  email: ""       // आपका email sandeepailearn2012@gmail.com
};
/* --------------------------------------------------- */

const DEFAULT_MESSAGE = "नमस्ते Sandeep Travelling Agency, मुझे यात्रा की जानकारी चाहिए।";
const isTenDigits = (value) => /^[6-9]\d{9}$/.test(value);

/* ---------- छोटा संदेश (toast) ---------- */
const toast = document.getElementById("toast");
let toastTimer;
function showToast(text) {
  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3500);
}

/* ---------- WhatsApp खोलना ---------- */
function openWhatsApp(message) {
  if (!isTenDigits(SETTINGS.whatsapp)) {
    showToast("पहले script.js में अपना WhatsApp नंबर डालें।");
    return false;
  }
  const url = "https://wa.me/91" + SETTINGS.whatsapp + "?text=" + encodeURIComponent(message);
  window.open(url, "_blank", "noopener");
  return true;
}

/* ---------- Page खुलते ही: नंबर/email भर देना ---------- */
function fillContactDetails() {
  if (isTenDigits(SETTINGS.phone)) {
    document.querySelectorAll("[data-call]").forEach((el) => {
      el.href = "tel:+91" + SETTINGS.phone;
    });
    document.querySelectorAll("[data-phone-text]").forEach((el) => {
      el.textContent = "+91 " + SETTINGS.phone;
    });
  }
  if (isTenDigits(SETTINGS.whatsapp)) {
    document.querySelectorAll("[data-whatsapp-text]").forEach((el) => {
      el.textContent = "+91 " + SETTINGS.whatsapp;
    });
  }
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(SETTINGS.email)) {
    document.querySelectorAll("[data-email-text]").forEach((el) => {
      el.textContent = SETTINGS.email;
    });
  }
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
}
fillContactDetails();

/* ---------- सारे WhatsApp / Call बटन ---------- */
document.addEventListener("click", (event) => {
  const wa = event.target.closest("[data-whatsapp]");
  if (wa) {
    event.preventDefault();
    openWhatsApp(wa.dataset.msg || DEFAULT_MESSAGE);
    return;
  }
  const call = event.target.closest("[data-call]");
  if (call && !isTenDigits(SETTINGS.phone)) {
    event.preventDefault();
    showToast("पहले script.js में अपना फ़ोन नंबर डालें।");
  }
});

/* ---------- Mobile menu ---------- */
const menuToggle = document.querySelector(".menu-toggle");
const menu = document.getElementById("menu");

menuToggle.addEventListener("click", () => {
  const isOpen = menu.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});
menu.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    menu.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }
});

/* ---------- Quick Enquiry form ---------- */
const form = document.getElementById("quick-form");

function setError(input, message) {
  const errorBox = document.getElementById("err-" + input.name);
  input.setAttribute("aria-invalid", message ? "true" : "false");
  if (!errorBox) return;
  errorBox.textContent = message;
  errorBox.hidden = !message;
}

if (form) form.addEventListener("submit", (event) => {
  event.preventDefault();

  // Spam से बचाव: छुपा हुआ खाना भरा हो तो कुछ न करें
  if (document.getElementById("q-website").value) return;

  const nameInput = document.getElementById("q-name");
  const mobileInput = document.getElementById("q-mobile");
  const destInput = document.getElementById("q-destination");

  const name = nameInput.value.trim();
  const destination = destInput.value.trim();
  let mobile = mobileInput.value.replace(/[\s-]/g, "");
  if (mobile.length > 10) mobile = mobile.replace(/^(\+91|91|0)/, "");

  let ok = true;

  if (name.length < 2) { setError(nameInput, "अपना नाम लिखें।"); ok = false; }
  else setError(nameInput, "");

  if (!isTenDigits(mobile)) { setError(mobileInput, "सही 10 अंकों का मोबाइल नंबर लिखें।"); ok = false; }
  else setError(mobileInput, "");

  if (destination.length < 2) { setError(destInput, "बताइए कहाँ जाना है।"); ok = false; }
  else setError(destInput, "");

  if (!ok) return;

  const message =
    "नमस्ते Sandeep Travelling Agency,\n" +
    "नाम: " + name + "\n" +
    "मोबाइल: " + mobile + "\n" +
    "कहाँ जाना है: " + destination + "\n" +
    "मुझे इस यात्रा की जानकारी चाहिए।";

  if (openWhatsApp(message)) form.reset();
});


/* =====================================================
   बड़े forms: Custom Tour Planner और Ticket Booking Enquiry
   (planner.html और booking.html में इस्तेमाल होते हैं)
   ===================================================== */

const cleanMobile = (raw) => {
  let m = String(raw).replace(/[\s-]/g, "");
  if (m.length > 10) m = m.replace(/^(\+91|91|0)/, "");
  return m;
};

const todayString = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
};

const prettyDate = (iso) => (iso ? iso.split("-").reverse().join("-") : "");

// "नाम: Ram" जैसी line बनाता है; खाली हो तो कुछ नहीं जोड़ता
const line = (label, value) => (value ? label + ": " + value : null);
const compose = (lines) => lines.filter((x) => x !== null).join("\n");

/* हर form का WhatsApp message कैसे बनेगा */
const FORMS = {
  planner: (v) => compose([
    "नमस्ते Sandeep Travelling Agency,",
    "मुझे Custom Tour Plan चाहिए।",
    "",
    line("नाम", v.name),
    line("मोबाइल", v.mobile),
    line("कहाँ से", v.startCity),
    line("कहाँ जाना है", v.destination),
    line("यात्रा की तारीख", prettyDate(v.travelDate)),
    "यात्री: " + v.adults + " बड़े, " + (v.children || 0) + " बच्चे",
    line("यात्रा का प्रकार", v.travelType),
    line("बजट", v.budget),
    line("होटल की पसंद", v.hotel),
    line("संदेश", v.message)
  ]),
  booking: (v) => compose([
    "नमस्ते Sandeep Travelling Agency,",
    "मुझे " + v.travelType + " टिकट की enquiry करनी है।",
    "",
    line("नाम", v.name),
    line("मोबाइल", v.mobile),
    line("कहाँ से", v.from),
    line("कहाँ तक", v.to),
    line("यात्रा की तारीख", prettyDate(v.journeyDate)),
    line("यात्री", v.passengers),
    line("संदेश", v.message)
  ])
};

/* एक खाने की जाँच: सही हो तो true */
function checkField(input) {
  let message = "";
  const value = input.value.trim();

  if (input.dataset.kind === "mobile") {
    if (!isTenDigits(cleanMobile(input.value))) message = "सही 10 अंकों का मोबाइल नंबर लिखें।";
  } else if (input.required && !value) {
    message = (input.dataset.label || "यह जानकारी") + " भरें।";
  } else if (input.type === "date" && value && value < todayString()) {
    message = "आज या आगे की तारीख चुनें।";
  } else if (input.type === "number" && value !== "") {
    const n = Number(value);
    if (!Number.isInteger(n) || n < Number(input.min) || n > Number(input.max)) {
      message = input.min + " से " + input.max + " के बीच संख्या लिखें।";
    }
  }

  setError(input, message);
  return message === "";
}

/* Form के सारे खानों की values एक object में */
function collectValues(formEl) {
  const values = {};
  new FormData(formEl).forEach((val, key) => {
    values[key] = typeof val === "string" ? val.trim() : val;
  });
  values.mobile = values.mobile ? cleanMobile(values.mobile) : "";
  return values;
}

/* Enquiry भेजना। अभी WhatsApp खुलता है।
   Step 5 (backend) में यहाँ server को भेजने का code जुड़ेगा। */
function submitEnquiry(enquiry, message) {
  // Step 5 में:
  // fetch("/api/enquiries", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(enquiry)
  // });
  return openWhatsApp(message);
}

/* आज से पहले की तारीख date-picker में चुनने न दें */
document.querySelectorAll('input[type="date"]').forEach((input) => {
  input.min = todayString();
});

document.querySelectorAll("form[data-enquiry]").forEach((formEl) => {
  formEl.addEventListener("submit", (event) => {
    event.preventDefault();

    const values = collectValues(formEl);
    if (values.website) return; // Spam से बचाव: छुपा खाना भरा हो तो कुछ न करें

    const fields = formEl.querySelectorAll(
      'input[name]:not([type="radio"]):not([name="website"]), select[name], textarea[name]'
    );
    let firstBad = null;
    fields.forEach((input) => {
      if (!checkField(input) && !firstBad) firstBad = input;
    });
    if (firstBad) {
      firstBad.focus();
      return;
    }

    const type = formEl.dataset.enquiry;
    const enquiry = Object.assign({ type: type, createdAt: new Date().toISOString() }, values);
    delete enquiry.website;

    if (submitEnquiry(enquiry, FORMS[type](values))) formEl.reset();
  });
});
