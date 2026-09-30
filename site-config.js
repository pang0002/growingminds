// ============================================================
// GROWING MINDS — BOOKING CONFIG (used by register.html)
// Each programme page links to: register.html?item=<key>
// ============================================================
window.GM_CONFIG = {

  // WhatsApp number, digits only, with country code
  whatsapp: '60173886326',

  // Paste the Web app URL from your Google Apps Script here
  // (deploy form-receiver.gs, see the setup steps at the top of that file).
  // While this is empty, register.html falls back to a pre-written WhatsApp message.
  formEndpoint: '',

  // Optional payment links, one per item key below.
  // If an item has no link, parents are sent to WhatsApp to get the payment details.
  // e.g.  'kindy-month': 'https://your-payment-link'
  pay: {},

  // name, price, ages ([min, max] in whole years; outside this range the form shows a gentle warning),
  // choice (adds a required dropdown, optional)
  items: {
    'calm-club': {
      name: 'Social-Emotional Friendship Club (4 weeks)', price: 'RM 399', ages: [4, 9],
      choice: { label: 'Which age group?', options: ['Ages 4–6', 'Ages 7–9'] }
    },
    'brain-booster': {
      name: 'Brain Booster Club (4 weeks)', price: 'RM 399', ages: [8, 13],
      choice: { label: 'Which age group?', options: ['Ages 8–10', 'Ages 11–13'] }
    },
    'kindy-trial':   { name: 'Kindergarten Readiness: trial session', price: 'RM 50',  ages: [3, 6] },
    'kindy-month':   { name: 'Kindergarten Readiness: monthly', price: 'RM 399', ages: [3, 6] },
    'primary-trial': { name: 'Primary School Readiness: trial session', price: 'RM 50',  ages: [5, 6] },
    'primary-month': { name: 'Primary School Readiness: monthly', price: 'RM 399', ages: [5, 6] },
    'readiness-trial': {
      name: 'School Readiness: trial session', price: 'RM 50',
      choice: { label: 'Which pathway?', options: ['Kindergarten Readiness (ages 3–6)', 'Primary School Readiness (ages 5–6)'] }
    },
    'readiness-month': {
      name: 'School Readiness: monthly', price: 'RM 399',
      choice: { label: 'Which pathway?', options: ['Kindergarten Readiness (ages 3–6)', 'Primary School Readiness (ages 5–6)'] }
    }
  }
};