/* =========================================================
   CV Builder Pro — script.js
   Vanilla JS · No dependencies
   PDF generation via pure HTML/CSS printed in a hidden iframe
   ========================================================= */

'use strict';

/* ─── CONSTANTS ──────────────────────────────────────────── */
const LANG_OPTIONS = ['Excellent', 'Very Good', 'Good', 'Fair', 'Basic', 'Not Applicable'];
const LANGUAGES = [
  { key: 'rohingya', label: 'Rohingya' },
  { key: 'burmese',  label: 'Burmese'  },
  { key: 'bengali',  label: 'Bengali'  },
  { key: 'english',  label: 'English'  },
  { key: 'other',    label: 'Other'    },
];
const SKILLS_FIELDS = [
  'Speaking', 'Reading', 'Writing', 'Listening'
];

let currentStep = 1;
let photoDataURL  = null;
let cvBlobURL     = null;

/* ─── DOM READY ──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNav();
  initPhotoUpload();
  initLanguageTable();
  initExperienceEntries();
  initEducationEntries();
  initTrainingEntries();
  initReferenceEntries();
  initModal();
  document.getElementById('current-year').textContent = new Date().getFullYear();
  updateStepRail(1);
});

/* ─── THEME ──────────────────────────────────────────────── */
function initTheme() {
  const btn  = document.getElementById('theme-toggle');
  const html = document.documentElement;
  const saved = localStorage.getItem('cvb-theme') || 'light';
  applyTheme(saved);

  btn.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('cvb-theme', next);
  });
}

function applyTheme(theme) {
  const html = document.documentElement;
  const icon = document.querySelector('#theme-toggle i');
  html.setAttribute('data-theme', theme);
  if (icon) {
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
}

/* ─── NAVIGATION ─────────────────────────────────────────── */
function initNav() {
  const hamburger = document.getElementById('nav-hamburger');
  const mobileNav = document.getElementById('mobile-nav');

  hamburger.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
    mobileNav.setAttribute('aria-hidden', !isOpen);
  });

  // Close on link click
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileNav.setAttribute('aria-hidden', 'true');
    });
  });

  // Smooth scroll for all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = document.getElementById('site-header').offsetHeight + 16;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

/* ─── STEP NAVIGATION ────────────────────────────────────── */
function goToStep(step) {
  if (step < 1 || step > 8) return;

  // Mark previous as completed
  if (step > currentStep) {
    document.querySelector(`.step-item[data-step="${currentStep}"]`)?.classList.add('completed');
  }

  document.querySelectorAll('.form-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.step-item').forEach(s => s.classList.remove('active'));

  const panel = document.getElementById(`panel-${step}`);
  const stepEl = document.querySelector(`.step-item[data-step="${step}"]`);

  if (panel) panel.classList.add('active');
  if (stepEl) {
    stepEl.classList.add('active');
    stepEl.classList.remove('completed');
  }

  currentStep = step;

  // Scroll to form section top
  const section = document.getElementById('create-cv');
  if (section) {
    const offset = document.getElementById('site-header').offsetHeight + 16;
    const top = section.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

// Allow clicking step rail items
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.step-item').forEach(item => {
    item.addEventListener('click', () => {
      const step = parseInt(item.getAttribute('data-step'), 10);
      goToStep(step);
    });
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const step = parseInt(item.getAttribute('data-step'), 10);
        goToStep(step);
      }
    });
  });
});

function updateStepRail(step) {
  document.querySelectorAll('.step-item').forEach(el => {
    const s = parseInt(el.getAttribute('data-step'), 10);
    el.classList.toggle('active', s === step);
  });
}

/* ─── PHOTO UPLOAD ───────────────────────────────────────── */
function initPhotoUpload() {
  const area    = document.getElementById('photo-upload-area');
  const input   = document.getElementById('photo-input');
  const preview = document.getElementById('photo-img');

  area.addEventListener('click', () => input.click());
  area.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); }
  });

  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG or PNG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      photoDataURL = e.target.result;
      preview.src = photoDataURL;
    };
    reader.readAsDataURL(file);
  });

  // Drag and drop
  area.addEventListener('dragover', e => { e.preventDefault(); area.style.borderColor = 'var(--color-brand)'; });
  area.addEventListener('dragleave', () => { area.style.borderColor = ''; });
  area.addEventListener('drop', e => {
    e.preventDefault();
    area.style.borderColor = '';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = ev => {
        photoDataURL = ev.target.result;
        preview.src = photoDataURL;
      };
      reader.readAsDataURL(file);
    }
  });
}

/* ─── LANGUAGE TABLE ─────────────────────────────────────── */
function initLanguageTable() {
  const tbody = document.getElementById('lang-table-body');
  if (!tbody) return;

  LANGUAGES.forEach(lang => {
    const tr = document.createElement('tr');
    let cells = `<td>${lang.label}</td>`;
    SKILLS_FIELDS.forEach(skill => {
      const id = `lang-${lang.key}-${skill.toLowerCase()}`;
      cells += `
        <td>
          <select id="${id}" name="${id}" class="field-input field-select" aria-label="${lang.label} ${skill}">
            ${LANG_OPTIONS.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
          </select>
        </td>`;
    });
    tr.innerHTML = cells;
    tbody.appendChild(tr);
  });
}

/* ─── DYNAMIC ENTRY BUILDERS ─────────────────────────────── */

/* ── Work Experience ── */
let expCount = 0;

function initExperienceEntries() {
  addExperienceEntry();
  document.getElementById('add-experience').addEventListener('click', addExperienceEntry);
}

function addExperienceEntry() {
  expCount++;
  const container = document.getElementById('experience-entries');
  const div = document.createElement('div');
  div.className = 'entry-card';
  div.id = `exp-${expCount}`;
  div.innerHTML = `
    <div class="entry-card-header">
      <span class="entry-card-title">Experience #${expCount}</span>
      ${expCount > 1 ? `<button type="button" class="entry-remove" onclick="removeEntry('exp-${expCount}')" aria-label="Remove experience #${expCount}"><i class="fas fa-times" aria-hidden="true"></i></button>` : ''}
    </div>
    <div class="field-grid field-grid--2">
      <div class="field-group">
        <label class="field-label" for="exp-org-${expCount}">Organization / NGO / Company Name</label>
        <input type="text" id="exp-org-${expCount}" name="expOrg_${expCount}" class="field-input" placeholder="e.g. UNHCR, BRAC, MSF..." />
      </div>
      <div class="field-group">
        <label class="field-label" for="exp-pos-${expCount}">Position / Job Title</label>
        <input type="text" id="exp-pos-${expCount}" name="expPos_${expCount}" class="field-input" placeholder="e.g. Field Officer" />
      </div>
      <div class="field-group">
        <label class="field-label" for="exp-dept-${expCount}">Department</label>
        <input type="text" id="exp-dept-${expCount}" name="expDept_${expCount}" class="field-input" placeholder="e.g. Protection, WASH..." />
      </div>
      <div class="field-group">
        <label class="field-label" for="exp-years-${expCount}">Years of Experience</label>
        <input type="text" id="exp-years-${expCount}" name="expYears_${expCount}" class="field-input" placeholder="e.g. 2 years 3 months" />
      </div>
      <div class="field-group">
        <label class="field-label" for="exp-start-${expCount}">Start Date</label>
        <input type="month" id="exp-start-${expCount}" name="expStart_${expCount}" class="field-input" />
      </div>
      <div class="field-group">
        <label class="field-label" for="exp-end-${expCount}">End Date</label>
        <input type="month" id="exp-end-${expCount}" name="expEnd_${expCount}" class="field-input" placeholder="Leave blank if current" />
      </div>
    </div>
    <div class="field-grid field-grid--1">
      <div class="field-group">
        <label class="field-label" for="exp-resp-${expCount}">Key Responsibilities</label>
        <textarea id="exp-resp-${expCount}" name="expResp_${expCount}" class="field-input field-textarea" rows="3" placeholder="Describe your main duties and responsibilities..."></textarea>
      </div>
      <div class="field-group">
        <label class="field-label" for="exp-ach-${expCount}">Achievements</label>
        <textarea id="exp-ach-${expCount}" name="expAch_${expCount}" class="field-input field-textarea" rows="2" placeholder="Key accomplishments in this role..."></textarea>
      </div>
    </div>`;
  container.appendChild(div);
}

/* ── Education ── */
let eduCount = 0;

function initEducationEntries() {
  addEducationEntry();
  document.getElementById('add-education').addEventListener('click', addEducationEntry);
}

function addEducationEntry() {
  eduCount++;
  const container = document.getElementById('education-entries');
  const div = document.createElement('div');
  div.className = 'entry-card';
  div.id = `edu-${eduCount}`;
  div.innerHTML = `
    <div class="entry-card-header">
      <span class="entry-card-title">Education #${eduCount}</span>
      ${eduCount > 1 ? `<button type="button" class="entry-remove" onclick="removeEntry('edu-${eduCount}')" aria-label="Remove education #${eduCount}"><i class="fas fa-times" aria-hidden="true"></i></button>` : ''}
    </div>
    <div class="field-grid field-grid--2">
      <div class="field-group">
        <label class="field-label" for="edu-inst-${eduCount}">Institution Name</label>
        <input type="text" id="edu-inst-${eduCount}" name="eduInst_${eduCount}" class="field-input" placeholder="e.g. Chittagong University" />
      </div>
      <div class="field-group">
        <label class="field-label" for="edu-qual-${eduCount}">Qualification / Degree</label>
        <input type="text" id="edu-qual-${eduCount}" name="eduQual_${eduCount}" class="field-input" placeholder="e.g. Bachelor of Arts" />
      </div>
      <div class="field-group">
        <label class="field-label" for="edu-field-${eduCount}">Field of Study</label>
        <input type="text" id="edu-field-${eduCount}" name="eduField_${eduCount}" class="field-input" placeholder="e.g. Social Work, Education..." />
      </div>
      <div class="field-group">
        <label class="field-label" for="edu-year-${eduCount}">Year Completed</label>
        <input type="text" id="edu-year-${eduCount}" name="eduYear_${eduCount}" class="field-input" placeholder="e.g. 2019" maxlength="4" />
      </div>
      <div class="field-group">
        <label class="field-label" for="edu-result-${eduCount}">Result / Grade / GPA</label>
        <input type="text" id="edu-result-${eduCount}" name="eduResult_${eduCount}" class="field-input" placeholder="e.g. 3.75/4.00 or First Class" />
      </div>
    </div>`;
  container.appendChild(div);
}

/* ── Training & Certifications ── */
let trainCount = 0;

function initTrainingEntries() {
  addTrainingEntry();
  document.getElementById('add-training').addEventListener('click', addTrainingEntry);
}

function addTrainingEntry() {
  trainCount++;
  const container = document.getElementById('training-entries');
  const div = document.createElement('div');
  div.className = 'entry-card';
  div.id = `train-${trainCount}`;
  div.innerHTML = `
    <div class="entry-card-header">
      <span class="entry-card-title">Training #${trainCount}</span>
      ${trainCount > 1 ? `<button type="button" class="entry-remove" onclick="removeEntry('train-${trainCount}')" aria-label="Remove training #${trainCount}"><i class="fas fa-times" aria-hidden="true"></i></button>` : ''}
    </div>
    <div class="field-grid field-grid--2">
      <div class="field-group">
        <label class="field-label" for="train-name-${trainCount}">Training / Course Name</label>
        <input type="text" id="train-name-${trainCount}" name="trainName_${trainCount}" class="field-input" placeholder="e.g. Protection from Sexual Exploitation..." />
      </div>
      <div class="field-group">
        <label class="field-label" for="train-org-${trainCount}">Organizing Institution</label>
        <input type="text" id="train-org-${trainCount}" name="trainOrg_${trainCount}" class="field-input" placeholder="e.g. UNHCR, Save the Children..." />
      </div>
      <div class="field-group">
        <label class="field-label" for="train-year-${trainCount}">Year</label>
        <input type="text" id="train-year-${trainCount}" name="trainYear_${trainCount}" class="field-input" placeholder="e.g. 2023" maxlength="4" />
      </div>
      <div class="field-group">
        <label class="field-label" for="train-dur-${trainCount}">Duration</label>
        <input type="text" id="train-dur-${trainCount}" name="trainDur_${trainCount}" class="field-input" placeholder="e.g. 3 days, 2 weeks..." />
      </div>
      <div class="field-group">
        <label class="field-label" for="train-cert-${trainCount}">Certificate Received</label>
        <select id="train-cert-${trainCount}" name="trainCert_${trainCount}" class="field-input field-select">
          <option value="Yes">Yes</option>
          <option value="No">No</option>
          <option value="Participation">Participation Certificate</option>
          <option value="Pending">Pending</option>
        </select>
      </div>
    </div>`;
  container.appendChild(div);
}

/* ── References ── */
let refCount = 0;

function initReferenceEntries() {
  addReferenceEntry();
  document.getElementById('add-reference').addEventListener('click', addReferenceEntry);
}

function addReferenceEntry() {
  refCount++;
  const container = document.getElementById('reference-entries');
  const div = document.createElement('div');
  div.className = 'entry-card';
  div.id = `ref-${refCount}`;
  div.innerHTML = `
    <div class="entry-card-header">
      <span class="entry-card-title">Reference #${refCount}</span>
      ${refCount > 1 ? `<button type="button" class="entry-remove" onclick="removeEntry('ref-${refCount}')" aria-label="Remove reference #${refCount}"><i class="fas fa-times" aria-hidden="true"></i></button>` : ''}
    </div>
    <div class="field-grid field-grid--2">
      <div class="field-group">
        <label class="field-label" for="ref-name-${refCount}">Reference Person Name</label>
        <input type="text" id="ref-name-${refCount}" name="refName_${refCount}" class="field-input" placeholder="Full name..." />
      </div>
      <div class="field-group">
        <label class="field-label" for="ref-pos-${refCount}">Position / Title</label>
        <input type="text" id="ref-pos-${refCount}" name="refPos_${refCount}" class="field-input" placeholder="e.g. Programme Manager" />
      </div>
      <div class="field-group">
        <label class="field-label" for="ref-org-${refCount}">Organization</label>
        <input type="text" id="ref-org-${refCount}" name="refOrg_${refCount}" class="field-input" placeholder="e.g. UNICEF, IOM..." />
      </div>
      <div class="field-group">
        <label class="field-label" for="ref-phone-${refCount}">Phone Number</label>
        <input type="tel" id="ref-phone-${refCount}" name="refPhone_${refCount}" class="field-input" placeholder="+880..." />
      </div>
      <div class="field-group">
        <label class="field-label" for="ref-email-${refCount}">Email Address</label>
        <input type="email" id="ref-email-${refCount}" name="refEmail_${refCount}" class="field-input" placeholder="name@organization.org" />
      </div>
      <div class="field-group">
        <label class="field-label" for="ref-rel-${refCount}">Relationship</label>
        <input type="text" id="ref-rel-${refCount}" name="refRel_${refCount}" class="field-input" placeholder="e.g. Direct Supervisor..." />
      </div>
    </div>`;
  container.appendChild(div);
}

/* ── Generic remove ── */
function removeEntry(id) {
  const el = document.getElementById(id);
  if (el) {
    el.style.opacity = '0';
    el.style.transform = 'translateX(-8px)';
    el.style.transition = 'all 0.2s ease';
    setTimeout(() => el.remove(), 220);
  }
}

/* ─── MODAL ──────────────────────────────────────────────── */
function initModal() {
  const overlay   = document.getElementById('pdf-modal');
  const closeBtn  = document.getElementById('modal-close');
  const closeBtn2 = document.getElementById('modal-close-btn');

  [closeBtn, closeBtn2].forEach(btn => {
    if (btn) btn.addEventListener('click', closeModal);
  });

  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
  });
}

function openModal() {
  const overlay = document.getElementById('pdf-modal');
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  document.getElementById('modal-loading').style.display = 'flex';
  document.getElementById('modal-ready').style.display   = 'none';
  document.getElementById('pdf-modal-title').textContent = 'Generating Your CV...';
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const overlay = document.getElementById('pdf-modal');
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function showModalReady() {
  document.getElementById('modal-loading').style.display = 'none';
  document.getElementById('modal-ready').style.display   = 'block';
  document.getElementById('pdf-modal-title').textContent = 'Your CV is Ready!';
}

/* ─── DATA COLLECTION ────────────────────────────────────── */
function collectFormData() {
  const g = id => (document.getElementById(id)?.value || '').trim();

  // Personal
  const personal = {
    fullName:         g('full-name'),
    fatherName:       g('father-name'),
    motherName:       g('mother-name'),
    dob:              g('dob'),
    sex:              g('sex'),
    religion:         g('religion'),
    country:          g('country'),
    nationality:      g('nationality'),
    phone:            g('phone'),
    email:            g('email'),
    fcn:              g('fcn'),
    progressId:       g('progress-id'),
    mohaId:           g('moha-id'),
    qualification:    g('qualification'),
    permanentAddress: g('permanent-address'),
    currentAddress:   g('current-address'),
    profileSummary:   g('profile-summary'),
    photo:            photoDataURL,
  };

  // Languages
  const languages = LANGUAGES.map(lang => ({
    label:     lang.label,
    speaking:  document.getElementById(`lang-${lang.key}-speaking`)?.value  || 'Not Applicable',
    reading:   document.getElementById(`lang-${lang.key}-reading`)?.value   || 'Not Applicable',
    writing:   document.getElementById(`lang-${lang.key}-writing`)?.value   || 'Not Applicable',
    listening: document.getElementById(`lang-${lang.key}-listening`)?.value || 'Not Applicable',
  }));

  // Experience
  const experiences = [];
  for (let i = 1; i <= expCount; i++) {
    const el = document.getElementById(`exp-${i}`);
    if (!el) continue;
    const org  = (document.getElementById(`exp-org-${i}`)?.value  || '').trim();
    const pos  = (document.getElementById(`exp-pos-${i}`)?.value  || '').trim();
    if (!org && !pos) continue;
    const start = document.getElementById(`exp-start-${i}`)?.value || '';
    const end   = document.getElementById(`exp-end-${i}`)?.value   || '';
    experiences.push({
      org,
      position:  pos,
      dept:      (document.getElementById(`exp-dept-${i}`)?.value  || '').trim(),
      years:     (document.getElementById(`exp-years-${i}`)?.value || '').trim(),
      duration:  formatDateRange(start, end),
      resp:      (document.getElementById(`exp-resp-${i}`)?.value  || '').trim(),
      ach:       (document.getElementById(`exp-ach-${i}`)?.value   || '').trim(),
    });
  }

  // Education
  const education = [];
  for (let i = 1; i <= eduCount; i++) {
    const el = document.getElementById(`edu-${i}`);
    if (!el) continue;
    const inst = (document.getElementById(`edu-inst-${i}`)?.value || '').trim();
    if (!inst) continue;
    education.push({
      institution: inst,
      qualification: (document.getElementById(`edu-qual-${i}`)?.value   || '').trim(),
      field:         (document.getElementById(`edu-field-${i}`)?.value  || '').trim(),
      year:          (document.getElementById(`edu-year-${i}`)?.value   || '').trim(),
      result:        (document.getElementById(`edu-result-${i}`)?.value || '').trim(),
    });
  }

  // Skills
  const skills = {
    technical:     g('technical-skills'),
    computer:      g('computer-skills'),
    communication: g('communication-skills'),
    leadership:    g('leadership-skills'),
    training:      g('training-skills'),
    other:         g('other-skills'),
  };

  // Training
  const trainings = [];
  for (let i = 1; i <= trainCount; i++) {
    const el = document.getElementById(`train-${i}`);
    if (!el) continue;
    const name = (document.getElementById(`train-name-${i}`)?.value || '').trim();
    if (!name) continue;
    trainings.push({
      name,
      org:  (document.getElementById(`train-org-${i}`)?.value  || '').trim(),
      year: (document.getElementById(`train-year-${i}`)?.value || '').trim(),
      dur:  (document.getElementById(`train-dur-${i}`)?.value  || '').trim(),
      cert: (document.getElementById(`train-cert-${i}`)?.value || '').trim(),
    });
  }

  // References
  const references = [];
  for (let i = 1; i <= refCount; i++) {
    const el = document.getElementById(`ref-${i}`);
    if (!el) continue;
    const name = (document.getElementById(`ref-name-${i}`)?.value || '').trim();
    if (!name) continue;
    references.push({
      name,
      position: (document.getElementById(`ref-pos-${i}`)?.value   || '').trim(),
      org:      (document.getElementById(`ref-org-${i}`)?.value   || '').trim(),
      phone:    (document.getElementById(`ref-phone-${i}`)?.value || '').trim(),
      email:    (document.getElementById(`ref-email-${i}`)?.value || '').trim(),
      rel:      (document.getElementById(`ref-rel-${i}`)?.value   || '').trim(),
    });
  }

  return { personal, languages, experiences, education, skills, trainings, references };
}

function formatDateRange(start, end) {
  if (!start && !end) return '';
  const fmt = val => {
    if (!val) return 'Present';
    const [y, m] = val.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[parseInt(m,10)-1]} ${y}`;
  };
  return `${fmt(start)} – ${fmt(end)}`;
}

/* ─── PDF GENERATION ─────────────────────────────────────── */
function generateCV() {
  const agreed = document.getElementById('declaration-agree')?.checked;
  if (!agreed) {
    alert('Please check the declaration checkbox before generating your CV.');
    return;
  }

  const name = (document.getElementById('full-name')?.value || '').trim();
  if (!name) {
    alert('Please enter your full name in Section 1 before generating.');
    goToStep(1);
    return;
  }

  openModal();

  const data = collectFormData();

  // Slight delay to allow modal animation to render
  setTimeout(() => {
    try {
      const htmlContent = buildPDFHTML(data);
      triggerPrint(htmlContent, data.personal.fullName || 'CV');
      showModalReady();
    } catch (err) {
      console.error('CV generation error:', err);
      closeModal();
      alert('There was an error generating your CV. Please try again.');
    }
  }, 600);
}

/* ─── BUILD PDF HTML ─────────────────────────────────────── */
function buildPDFHTML(data) {
  const { personal, languages, experiences, education, skills, trainings, references } = data;

  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

  // Photo is positioned absolutely in the top-right corner of the personal section
  const photoFloatBlock = personal.photo
    ? `<img src="${personal.photo}" alt="Applicant photo" class="cv-photo-float" />`
    : `<div class="cv-photo-float cv-photo-float--empty"><span>Photo</span></div>`;

  const infoRow = (label, value) => value
    ? `<tr><td class="info-label">${label}</td><td class="info-sep">:</td><td class="info-value">${escHtml(value)}</td></tr>`
    : '';

  const personalTable = `
    <table class="info-table">
      <tbody>
        ${infoRow('Full Name',          personal.fullName)}
        ${infoRow("Father's Name",      personal.fatherName)}
        ${infoRow("Mother's Name",      personal.motherName)}
        ${infoRow('Date of Birth',      personal.dob ? formatDisplayDate(personal.dob) : '')}
        ${infoRow('Sex',                personal.sex)}
        ${infoRow('Religion',           personal.religion)}
        ${infoRow('Country',            personal.country)}
        ${infoRow('Nationality',        personal.nationality)}
        ${infoRow('Phone Number',       personal.phone)}
        ${infoRow('Email Address',      personal.email)}
        ${infoRow('FCN Number',         personal.fcn)}
        ${infoRow('Progress ID',        personal.progressId)}
        ${infoRow('MOHA ID',            personal.mohaId)}
        ${infoRow('Permanent Address',  personal.permanentAddress)}
        ${infoRow('Current Address',    personal.currentAddress)}
        ${infoRow('Qualification',      personal.qualification)}
      </tbody>
    </table>`;

  const profileBlock = personal.profileSummary
    ? `<div class="cv-section-block">
        <div class="cv-section-title">Profile Summary</div>
        <p class="cv-paragraph">${escHtml(personal.profileSummary)}</p>
      </div>`
    : '';

  // Language table
  const langRows = languages.map(l => `
    <tr>
      <td class="lang-name">${escHtml(l.label)}</td>
      <td>${profBadge(l.speaking)}</td>
      <td>${profBadge(l.reading)}</td>
      <td>${profBadge(l.writing)}</td>
      <td>${profBadge(l.listening)}</td>
    </tr>`).join('');

  const langBlock = `
    <div class="cv-section-block">
      <div class="cv-section-title">Language Proficiency</div>
      <table class="cv-table">
        <thead>
          <tr>
            <th>Language</th>
            <th>Speaking</th>
            <th>Reading</th>
            <th>Writing</th>
            <th>Listening</th>
          </tr>
        </thead>
        <tbody>${langRows}</tbody>
      </table>
    </div>`;

  // Experience
  const expBlock = experiences.length > 0 ? `
    <div class="cv-section-block">
      <div class="cv-section-title">Work Experience</div>
      <table class="cv-table">
        <thead>
          <tr>
            <th>Organization</th>
            <th>Position</th>
            <th>Duration</th>
            <th>Experience</th>
            <th>Key Responsibilities</th>
          </tr>
        </thead>
        <tbody>
          ${experiences.map(exp => `
          <tr>
            <td><strong>${escHtml(exp.org)}</strong>${exp.dept ? `<br><span class="sub">${escHtml(exp.dept)}</span>` : ''}</td>
            <td>${escHtml(exp.position)}</td>
            <td class="nowrap">${escHtml(exp.duration)}</td>
            <td class="nowrap">${escHtml(exp.years)}</td>
            <td>${exp.resp ? escHtml(exp.resp) : '—'}${exp.ach ? `<br><em class="ach">Achievement: ${escHtml(exp.ach)}</em>` : ''}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>` : '';

  // Education
  const eduBlock = education.length > 0 ? `
    <div class="cv-section-block">
      <div class="cv-section-title">Education</div>
      <table class="cv-table">
        <thead>
          <tr>
            <th>Institution</th>
            <th>Qualification</th>
            <th>Field of Study</th>
            <th>Year</th>
            <th>Result / Grade</th>
          </tr>
        </thead>
        <tbody>
          ${education.map(edu => `
          <tr>
            <td>${escHtml(edu.institution)}</td>
            <td>${escHtml(edu.qualification)}</td>
            <td>${escHtml(edu.field)}</td>
            <td class="nowrap">${escHtml(edu.year)}</td>
            <td>${escHtml(edu.result)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>` : '';

  // Skills
  const skillCategories = [
    { label: 'Technical Skills',         value: skills.technical     },
    { label: 'Computer Skills',          value: skills.computer      },
    { label: 'Communication Skills',     value: skills.communication },
    { label: 'Leadership Skills',        value: skills.leadership    },
    { label: 'Training & Facilitation',  value: skills.training      },
    { label: 'Other Skills',             value: skills.other         },
  ].filter(s => s.value);

  const skillBlock = skillCategories.length > 0 ? `
    <div class="cv-section-block">
      <div class="cv-section-title">Skills &amp; Abilities</div>
      ${skillCategories.map(s => `
        <div class="skill-row">
          <div class="skill-cat">${escHtml(s.label)}</div>
          <div class="skill-items">${buildSkillTags(s.value)}</div>
        </div>`).join('')}
    </div>` : '';

  // Trainings
  const trainBlock = trainings.length > 0 ? `
    <div class="cv-section-block">
      <div class="cv-section-title">Training &amp; Certifications</div>
      <table class="cv-table">
        <thead>
          <tr>
            <th>Training / Course</th>
            <th>Organization</th>
            <th>Year</th>
            <th>Duration</th>
            <th>Certificate</th>
          </tr>
        </thead>
        <tbody>
          ${trainings.map(t => `
          <tr>
            <td>${escHtml(t.name)}</td>
            <td>${escHtml(t.org)}</td>
            <td class="nowrap">${escHtml(t.year)}</td>
            <td>${escHtml(t.dur)}</td>
            <td>${escHtml(t.cert)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>` : '';

  // References
  const refBlock = references.length > 0 ? `
    <div class="cv-section-block">
      <div class="cv-section-title">References</div>
      <div class="ref-grid">
        ${references.map(r => `
        <div class="ref-card">
          <div class="ref-name">${escHtml(r.name)}</div>
          ${r.position ? `<div class="ref-detail"><span class="ref-label">Position:</span> ${escHtml(r.position)}</div>` : ''}
          ${r.org      ? `<div class="ref-detail"><span class="ref-label">Organization:</span> ${escHtml(r.org)}</div>` : ''}
          ${r.phone    ? `<div class="ref-detail"><span class="ref-label">Phone:</span> ${escHtml(r.phone)}</div>` : ''}
          ${r.email    ? `<div class="ref-detail"><span class="ref-label">Email:</span> ${escHtml(r.email)}</div>` : ''}
          ${r.rel      ? `<div class="ref-detail"><span class="ref-label">Relationship:</span> ${escHtml(r.rel)}</div>` : ''}
        </div>`).join('')}
      </div>
    </div>` : '';

  // Declaration & Signature
  const signatureBlock = `
    <div class="cv-section-block">
      <div class="cv-section-title">Declaration</div>
      <p class="cv-paragraph declaration-p">
        I hereby declare that the information provided above is true and accurate to the best of my knowledge and belief.
        I understand that any false or misleading information may lead to disqualification or termination of employment or volunteer position.
      </p>
      <div class="signature-row">
        <div class="sig-col">
          <div class="sig-line"></div>
          <div class="sig-label">${escHtml(personal.fullName || 'Applicant Name')}</div>
          <div class="sig-sub">Applicant Name</div>
        </div>
        <div class="sig-col sig-col--center">
          <div class="sig-line"></div>
          <div class="sig-label">${escHtml(today)}</div>
          <div class="sig-sub">Date</div>
        </div>
        <div class="sig-col">
          <div class="sig-line"></div>
          <div class="sig-label">&nbsp;</div>
          <div class="sig-sub">Applicant Signature</div>
        </div>
      </div>
    </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Curriculum Vitae — ${escHtml(personal.fullName || 'Applicant')}</title>
<style>
  /* === CV PDF STYLES === */
  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 10pt;
    color: #000000;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* Page setup */
  @page {
    size: A4;
    margin: 18mm 16mm 20mm 16mm;
  }

  .cv-wrapper {
    width: 100%;
    max-width: 720px;
    margin: 0 auto;
    padding: 0;
  }

  /* === HEADER === */
  .cv-header {
    text-align: center;
    border-bottom: 3px double #000000;
    padding-bottom: 12px;
    margin-bottom: 18px;
  }

  .cv-main-title {
    font-family: 'Times New Roman', serif;
    font-size: 22pt;
    font-weight: 700;
    letter-spacing: 6px;
    text-transform: uppercase;
    color: #000000;
    margin-bottom: 2px;
  }

  .cv-sub-title {
    font-size: 9pt;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #000000;
  }

  /* === PERSONAL INFO WRAPPER: position:relative so photo can be anchored top-right === */
  .cv-personal-wrap {
    position: relative;
    /* Right padding reserves space for the photo (width 100px + 10px gap) */
    padding-right: 115px;
    min-height: 130px;
  }

  /* === PHOTO: absolute, top-right corner of the personal section === */
  .cv-photo-float {
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;   /* ≈ 35mm */
    height: 126px;  /* ≈ 45mm — standard passport-photo proportions */
    object-fit: cover;
    border: 1.5px solid #000000;
    display: block;
  }

  .cv-photo-float--empty {
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;
    height: 126px;
    border: 1.5px dashed #aaa;
    background: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9pt;
    color: #000000;
  }

  /* === SECTION TITLE === */
  .cv-section-title {
    font-family: 'Times New Roman', serif;
    font-size: 10.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: #000000;
    background: #e8f0ea;
    padding: 4px 10px;
    margin-bottom: 8px;
    border-left: 4px solid #2E7D6B;
  }

  .cv-section-block {
    margin-bottom: 16px;
    page-break-inside: avoid;
  }

  /* === INFO TABLE === */
  .info-table {
    width: 100%;
    border-collapse: collapse;
  }

  .info-table td {
    padding: 2.5px 4px;
    font-size: 9.5pt;
    vertical-align: top;
    line-height: 1.45;
  }

  .info-label {
    width: 130px;
    font-weight: 600;
    color: #000000;
    white-space: nowrap;
  }

  .info-sep {
    width: 14px;
    color: #000000;
    text-align: center;
  }

  .info-value { color: #000000; }

  /* === CV TABLES === */
  .cv-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 9pt;
    margin-top: 4px;
  }

  .cv-table thead tr {
    background: #1B2A3B;
    color: #ffffff;
  }

  .cv-table th {
    padding: 5px 8px;
    text-align: left;
    font-size: 8.5pt;
    font-weight: 600;
    letter-spacing: .5px;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .cv-table td {
    padding: 5px 8px;
    vertical-align: top;
    border-bottom: 1px solid #e0e0e0;
    line-height: 1.4;
    color: #000000;
  }

  .cv-table tbody tr:last-child td { border-bottom: none; }
  .cv-table tbody tr:nth-child(even) td { background: #f9f9f9; }

  .lang-name { font-weight: 600; color: #000000; }

  .nowrap { white-space: nowrap; }

  .sub {
    font-size: 8pt;
    color: #000000;
    display: block;
    margin-top: 2px;
  }

  .ach {
    font-size: 8.5pt;
    color: #000000;
    display: block;
    margin-top: 3px;
  }

  /* === PROFICIENCY BADGES === */
  .prof-badge {
    display: inline-block;
    padding: 1px 7px;
    border-radius: 10px;
    font-size: 8pt;
    font-weight: 600;
    border: 1px solid;
  }

  /* All badge text is pure black; background tints are kept for visual distinction */
  .prof-excellent  { background: #d1fae5; color: #000000; border-color: #6ee7b7; }
  .prof-verygood   { background: #dbeafe; color: #000000; border-color: #93c5fd; }
  .prof-good       { background: #fef9c3; color: #000000; border-color: #fde68a; }
  .prof-fair       { background: #fee2e2; color: #000000; border-color: #fca5a5; }
  .prof-basic      { background: #f3f4f6; color: #000000; border-color: #d1d5db; }
  .prof-na         { background: #f9fafb; color: #000000; border-color: #e5e7eb; }

  /* === SKILLS === */
  .skill-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 5px 0;
    border-bottom: 1px dotted #e0e0e0;
  }

  .skill-row:last-child { border-bottom: none; }

  .skill-cat {
    width: 160px;
    flex-shrink: 0;
    font-weight: 600;
    font-size: 9pt;
    color: #000000;
    padding-top: 2px;
  }

  .skill-items {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }

  .skill-tag {
    display: inline-block;
    background: #f0fdf4;
    border: 1px solid #86efac;
    color: #000000;
    border-radius: 10px;
    padding: 1px 9px;
    font-size: 8.5pt;
  }

  /* === REFERENCES === */
  .ref-grid {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
  }

  .ref-card {
    flex: 1;
    min-width: 180px;
    border: 1px solid #ddd;
    border-top: 3px solid #2E7D6B;
    padding: 10px 12px;
    background: #fafafa;
    page-break-inside: avoid;
  }

  .ref-name {
    font-weight: 700;
    font-size: 9.5pt;
    color: #000000;
    margin-bottom: 5px;
  }

  .ref-detail {
    font-size: 8.5pt;
    color: #000000;
    margin-bottom: 2px;
    line-height: 1.4;
  }

  .ref-label {
    font-weight: 600;
    color: #000000;
  }

  /* === PARAGRAPH === */
  .cv-paragraph {
    font-size: 9.5pt;
    line-height: 1.6;
    color: #000000;
    text-align: justify;
  }

  .declaration-p {
    font-style: italic;
    color: #000000;
    margin-bottom: 16px;
    background: #f9f9f9;
    border-left: 3px solid #2E7D6B;
    padding: 8px 12px;
  }

  /* === SIGNATURE === */
  .signature-row {
    display: flex;
    gap: 20px;
    margin-top: 28px;
    page-break-inside: avoid;
  }

  .sig-col {
    flex: 1;
    text-align: center;
  }

  .sig-col--center { text-align: center; }

  .sig-line {
    width: 100%;
    border-bottom: 1.5px solid #000000;
    margin-bottom: 5px;
    height: 28px;
  }

  .sig-label {
    font-size: 9pt;
    font-weight: 600;
    color: #000000;
    min-height: 14px;
  }

  .sig-sub {
    font-size: 8pt;
    color: #000000;
    margin-top: 2px;
  }

  /* === FOOTER STRIP === */
  .cv-footer-strip {
    text-align: center;
    margin-top: 20px;
    padding-top: 8px;
    border-top: 1px solid #ccc;
    font-size: 7.5pt;
    color: #000000;
    letter-spacing: .5px;
  }

  /* === PAGE BREAK CONTROL === */
  .avoid-break { page-break-inside: avoid; }

  @media print {
    body { margin: 0; }
    .cv-wrapper { max-width: 100%; }
  }
</style>
</head>
<body>
<div class="cv-wrapper">

  <!-- HEADER -->
  <div class="cv-header">
    <div class="cv-main-title">Curriculum Vitae</div>
    <div class="cv-sub-title">Professional Application Document</div>
  </div>

  <!-- TOP: Personal Info with photo floated top-right -->
  <div class="cv-section-block avoid-break">
    <div class="cv-section-title">Personal Information</div>
    <div class="cv-personal-wrap">
      ${photoFloatBlock}
      ${personalTable}
    </div>
  </div>

  <!-- PROFILE SUMMARY -->
  ${profileBlock}

  <!-- LANGUAGES -->
  ${langBlock}

  <!-- WORK EXPERIENCE -->
  ${expBlock}

  <!-- EDUCATION -->
  ${eduBlock}

  <!-- SKILLS -->
  ${skillBlock}

  <!-- TRAINING -->
  ${trainBlock}

  <!-- REFERENCES -->
  ${refBlock}

  <!-- DECLARATION & SIGNATURE -->
  ${signatureBlock}

  <!-- FOOTER -->
  <div class="cv-footer-strip">
    Generated by CV Builder Pro · GRDM, Cox's Bazar, Bangladesh · ${escHtml(today)}
  </div>

</div>
</body>
</html>`;
}

/* ─── HELPERS ────────────────────────────────────────────── */
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, '<br>');
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `${parseInt(d, 10)} ${months[parseInt(m,10)-1]} ${y}`;
}

function profBadge(level) {
  const map = {
    'Excellent':       'prof-excellent',
    'Very Good':       'prof-verygood',
    'Good':            'prof-good',
    'Fair':            'prof-fair',
    'Basic':           'prof-basic',
    'Not Applicable':  'prof-na',
  };
  const cls = map[level] || 'prof-na';
  return `<span class="prof-badge ${cls}">${escHtml(level)}</span>`;
}

function buildSkillTags(raw) {
  if (!raw) return '';
  return raw
    .split(/[,\n]+/)
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => `<span class="skill-tag">${escHtml(s)}</span>`)
    .join('');
}

/* ─── PRINT via HIDDEN IFRAME ────────────────────────────── */
function triggerPrint(htmlContent, name) {
  // Remove any existing iframe
  const old = document.getElementById('cv-print-frame');
  if (old) old.remove();

  const iframe = document.createElement('iframe');
  iframe.id = 'cv-print-frame';
  iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:210mm;height:297mm;border:none;opacity:0;pointer-events:none;';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open();
  doc.write(htmlContent);
  doc.close();

  // Set up download button
  const downloadBtn = document.getElementById('download-btn');
  downloadBtn.onclick = () => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  };
}

/* ─── EXPOSE GLOBALS ─────────────────────────────────────── */
window.goToStep    = goToStep;
window.removeEntry = removeEntry;
window.generateCV  = generateCV;
