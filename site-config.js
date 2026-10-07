// ============================================================
// GROWING MINDS — BOOKING CONFIG (used by register.html)
// Each programme page links to: register.html?item=<key>
// ============================================================
window.GM_CONFIG = {

  // WhatsApp number, digits only, with country code
  whatsapp: '60173886326',

  // Paste the Web app URL from your Google Apps Script here
  formEndpoint: 'https://script.google.com/macros/s/AKfycbxONeIIAQBzGzZ6QW1Esr4f_rxeSPXQJzrGj9lX9ptwYwJoDAmLJzcyylgGLuWx2hicfw/exec',

  // Bank transfer / DuitNow QR shown after the form when an item has no online payment link.
  // Upload the QR image to the images folder, and keep the path below in step with it.
  payment: {
    bank: 'Maybank',
    accountName: 'Growing Minds Hub Enterprise',
    accountNumber: '564418762369',
    qr: 'images/payment-qr.png'
  },

  // Optional payment links, one per item key below.
  // If an item has no link, parents are sent to WhatsApp to get the payment details.
  // e.g.  'kindy-month': 'https://your-payment-link'
  pay: {},

  // name, price, ages ([min, max] in whole years; outside this range the form shows a gentle warning),
  // choice (adds a required dropdown, optional)
  items: {
    // ---- Weekend Club (Brain Booster + Friendship Club), ages 4-9 ----
    'brain-booster': {
      name: 'Brain Booster (4 weeks)', price: 'RM 399', ages: [4, 12],
      choice: { label: 'Which age group?', options: ['Ages 4–6', 'Ages 7–12'] }
    },
    'calm-club': {
      name: 'Friendship Club (4 weeks)', price: 'RM 399', ages: [4, 9],
      choice: { label: 'Which age group?', options: ['Ages 4–6', 'Ages 7–9'] }
    },
    'brain-booster-trial': {
      name: 'Brain Booster: trial session', price: 'RM 50', ages: [4, 12],
      note: 'Your RM 50 is credited to your first month if you join. We will send you the balance (RM 349).',
      choice: { label: 'Which age group?', options: ['Ages 4–6', 'Ages 7–12'] }
    },
    'calm-club-trial': {
      name: 'Friendship Club: trial session', price: 'RM 50', ages: [4, 9],
      note: 'Your RM 50 is credited to your first month if you join. We will send you the balance (RM 349).',
      choice: { label: 'Which age group?', options: ['Ages 4–6', 'Ages 7–9'] }
    },
    'weekend-trial': {
      name: 'Weekend Club: trial session', nameTemplate: '{choice}: trial session', price: 'RM 50', ages: [4, 12],
      note: 'Your RM 50 is credited to your first month if you join. We will send you the balance (RM 349).',
      choice: { label: 'Which club and age group?', options: ['Brain Booster, ages 4–6', 'Brain Booster, ages 7–12', 'Friendship Club, ages 4–6', 'Friendship Club, ages 7–9'] }
    },
    'weekend-month': {
      name: 'Weekend Club (4 weeks)', nameTemplate: '{choice} (4 weeks)', price: 'RM 399', ages: [4, 12],
      choice: { label: 'Which club and age group?', options: ['Brain Booster, ages 4–6', 'Brain Booster, ages 7–12', 'Friendship Club, ages 4–6', 'Friendship Club, ages 7–9'] }
    },
    'kindy-trial':   { name: 'Kindergarten Readiness: trial session', price: 'RM 50',  ages: [3, 6] },
    'kindy-month':   { name: 'Kindergarten Readiness: monthly', price: 'RM 399', ages: [3, 6] },
    'primary-trial': { name: 'Primary School Readiness: trial session', price: 'RM 50',  ages: [5, 6] },
    'primary-month': { name: 'Primary School Readiness: monthly', price: 'RM 399', ages: [5, 6] },
    'readiness-trial': {
      name: 'School Readiness: trial session', nameTemplate: '{choice}: trial session', price: 'RM 50',
      choice: { label: 'Which pathway?', options: ['Kindergarten Readiness (ages 3–6)', 'Primary School Readiness (ages 5–6)'] }
    },
    // ---- Assessment, Individual Support & EIP (time is allocated after registration / payment) ----
    'assessment': {
      name: 'Psychoeducational Assessment: registration', price: 'RM 50',
      intro: 'Two quick steps. First tell us about your child. Then pay the RM 50 registration fee.',
      note: 'The RM 50 is a registration fee. Your assessment date and time are allocated once your payment is done, and our team will message you on WhatsApp to confirm.',
      afterPay: 'Once your payment arrives, our team will send you a confirmation message on WhatsApp and allocate your assessment date and time.'
    },
    'individual-support': {
      name: 'Individual Learning Support: first session', price: 'RM 200',
      intro: 'Two quick steps. First tell us about your child. Then pay for the first session.',
      note: 'RM 200 covers your child\'s first session (45\u201360 minutes). The session date and time are allocated once your payment is done, and our team will message you on WhatsApp to confirm.',
      afterPay: 'Once your payment arrives, our team will send you a confirmation message on WhatsApp and allocate your child\'s first session date and time.'
    },
    'early-intervention': {
      name: 'Early Intervention Programme: registration', price: 'RM 50',
      intro: 'Two quick steps. First tell us about your child. Then pay the RM 50 registration fee.',
      note: 'The RM 50 is a registration fee. Your child\'s programme days and times are allocated once your payment is done, and our team will message you on WhatsApp to confirm.',
      afterPay: 'Once your payment arrives, our team will send you a confirmation message on WhatsApp and allocate your child\'s programme days and times.'
    },
    'readiness-month': {
      name: 'School Readiness: monthly', nameTemplate: '{choice}: monthly', price: 'RM 399',
      choice: { label: 'Which pathway?', options: ['Kindergarten Readiness (ages 3–6)', 'Primary School Readiness (ages 5–6)'] }
    }
  }
};