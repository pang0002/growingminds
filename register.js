// ============================================================
// BOOKING FORM (register.html)
// Reads the ?item= key from the URL, looks it up in GM_CONFIG
// (site-config.js), validates the form, saves it to the Google
// Apps Script receiver, then sends the parent to payment.
// Depends on site-config.js being loaded first.
// ============================================================

(function () {
  var C = window.GM_CONFIG || {};
  var items = C.items || {};
  var key = new URLSearchParams(location.search).get('item') || '';
  var item = items[key];
  var num = String(C.whatsapp || '').replace(/\D/g, '');
  var TERMS_VERSION = '1.0';
  var HI = 'Hi Growing Minds! ';
  function $(id) { return document.getElementById(id); }

  var form = $('reg'), missing = $('missing'), done = $('done');
  if (!item) { form.hidden = true; missing.hidden = false; return; }

  /* ---- item header ---- */
    $('itemName').textContent = item.name;
  $('itemPrice').textContent = item.price;
  document.title = 'Book: ' + item.name + ' | Growing Minds';
  if (item.intro) $('rIntro').textContent = item.intro;
  if (item.step2) $('rStep2').lastChild.nodeValue = ' ' + item.step2;
  if (item.note) { $('itemNote').textContent = item.note; $('itemNote').hidden = false; }
  if (item.noPayment) $('submitBtn').textContent = 'Agree, sign and submit';

  if (item.choice) {
    $('choiceLbl').firstChild.nodeValue = item.choice.label + ' ';
    var sel = $('choice');
    item.choice.options.forEach(function (o) {
      var op = document.createElement('option'); op.value = o; op.textContent = o; sel.appendChild(op);
    });
    $('choiceFld').hidden = false;
  }

  /* ---- date of birth: auto-slashes, real-date check, auto age ---- */
  var dob = $('childDob'), age = $('childAge');
  dob.addEventListener('input', function () {
    var d = dob.value.replace(/\D/g, '').slice(0, 8), out = d;
    if (d.length > 4) out = d.slice(0, 2) + '/' + d.slice(2, 4) + '/' + d.slice(4);
    else if (d.length > 2) out = d.slice(0, 2) + '/' + d.slice(2);
    dob.value = out; updateAge();
  });
  function parseDob(v) {
    var m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v); if (!m) return null;
    var d = +m[1], mo = +m[2], y = +m[3], dt = new Date(y, mo - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
    if (dt > new Date() || y < 2000) return null;
    return dt;
  }
  function ageOf(dt) {
    var n = new Date(), mths = (n.getFullYear() - dt.getFullYear()) * 12 + (n.getMonth() - dt.getMonth());
    if (n.getDate() < dt.getDate()) mths--;
    return { y: Math.floor(mths / 12), m: mths % 12 };
  }
  function updateAge() {
    var w = $('ageWarn'), dt = parseDob(dob.value);
    w.classList.remove('on'); w.textContent = '';
    if (!dt) { age.value = ''; return; }
    var a = ageOf(dt);
    age.value = a.y + ' yr' + (a.y === 1 ? '' : 's') + ' ' + a.m + ' mth' + (a.m === 1 ? '' : 's');
    if (item.ages && (a.y < item.ages[0] || a.y > item.ages[1])) {
      w.textContent = 'This is for ages ' + item.ages[0] + ' to ' + item.ages[1] + '. If your child is outside that range, please message us before paying.';
      w.classList.add('on');
    }
  }

  /* ---- signature pad ---- */
  var cv = $('sigCanvas'), ctx = cv.getContext('2d'), drawing = false, inked = false;
  cv.width = 900; cv.height = 300;
  ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#1F3C88';
  function pt(e) {
    var r = cv.getBoundingClientRect();
    return { x: (e.clientX - r.left) * cv.width / r.width, y: (e.clientY - r.top) * cv.height / r.height };
  }
  cv.addEventListener('pointerdown', function (e) {
    drawing = true; cv.setPointerCapture(e.pointerId);
    var p = pt(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + .1, p.y + .1); ctx.stroke();
    inked = true; $('sigPh').style.display = 'none'; e.preventDefault();
  });
  cv.addEventListener('pointermove', function (e) {
    if (!drawing) return; var p = pt(e); ctx.lineTo(p.x, p.y); ctx.stroke(); e.preventDefault();
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) {
    cv.addEventListener(ev, function () { drawing = false; });
  });
  $('sigClear').addEventListener('click', function () {
    ctx.clearRect(0, 0, cv.width, cv.height); inked = false; $('sigPh').style.display = '';
  });
  $('typedOnly').addEventListener('change', function () {
    $('sigBox').hidden = this.checked;
    $('sigTools').hidden = this.checked;
  });
  function stamp() {
    var n = new Date(), p = function (x) { return (x < 10 ? '0' : '') + x; };
    return p(n.getDate()) + '/' + p(n.getMonth() + 1) + '/' + n.getFullYear() + ' ' + p(n.getHours()) + ':' + p(n.getMinutes());
  }
  $('signedAt').textContent = 'Date and time of signing: ' + stamp() + ' (recorded when you submit)';

  /* ---- validation ---- */
  function bad(fldId, msg) {
    var box = $(fldId).closest('.fld, .chk, .sigwrap'); box.classList.add('bad');
    var e = box.querySelector('.err'); if (e) e.textContent = msg; return $(fldId);
  }
  function clear() {
    form.querySelectorAll('.bad').forEach(function (n) { n.classList.remove('bad'); });
  }
  function validate() {
    clear(); var first = null;
    function fail(el) { if (!first) first = el; }
    if (!$('parentName').value.trim()) fail(bad('parentName', 'Please enter your name.'));
    var digits = $('phone').value.replace(/\D/g, '');
    if (digits.length < 9 || digits.length > 15) fail(bad('phone', 'Please enter a phone number we can reach you on.'));
    if (!$('childName').value.trim()) fail(bad('childName', "Please enter your child's name."));
    if (!parseDob(dob.value)) fail(bad('childDob', 'Please enter a real date as DD/MM/YYYY, e.g. 14/03/2019.'));
    if (!form.querySelector('input[name=childGender]:checked')) fail(bad('gFirst', 'Please choose one.'));
    if (item.choice && !$('choice').value) fail(bad('choice', 'Please choose one.'));
    if (!$('allergies').value.trim()) fail(bad('allergies', 'Please tell us about any allergies, or write "None".'));
    if (!$('healthConsent').checked) fail(bad('healthConsent', 'We need your consent to use your child\'s health information.'));
    if (!$('agreeTerms').checked) fail(bad('agreeTerms', 'Please tick to agree to the terms.'));
    if (!$('signedName').value.trim()) fail(bad('signedName', 'Please type your full name.'));
    if (!$('typedOnly').checked && !inked) fail(bad('sigCanvas', 'Please sign in the box, or tick the option to sign by typing.'));
    return first;
  }

  /* ---- send ---- */
  function post(url, data) {
    var ctrl = new AbortController(), t = setTimeout(function () { ctrl.abort(); }, 25000);
    return fetch(url, {
      method: 'POST', mode: 'no-cors', signal: ctrl.signal,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(data)
    }).then(function () { clearTimeout(t); return true; })
      .catch(function () { clearTimeout(t); return false; });
  }
  function waLink(text) { return 'https://wa.me/' + num + '?text=' + encodeURIComponent(text); }

  function detailsMessage(d) {
    return HI + "I'd like to book: " + d.itemName + (item.noPayment ? '' : ' (' + d.amount + ')') + '.\n\n' +
      'Parent: ' + d.parentName + '\nPhone: ' + d.phone + '\n' +
      'Child: ' + d.childName + ' (born ' + d.childDob + ', ' + d.childAge + ', ' + d.childGender + ')\n' +
      (d.choice ? 'Choice: ' + d.choice + '\n' : '') +
      'Allergies: ' + d.allergies + '\nImportant notes: ' + (d.notes || 'None') + '\n' +
      'Photo consent: ' + d.photoConsent + '\n' +
      'Terms v' + d.termsVersion + ' agreed and signed by ' + d.signedName + ' on ' + d.signedAt + '.';
  }

  function step2() {
    var s = document.querySelectorAll('.prog2 li');
    s[0].className = 'done'; s[1].className = 'on';
  }
  function show(html) {
    form.hidden = true; done.innerHTML = html; done.hidden = false; step2();
    window.scrollTo({ top: 0, behavior: 'smooth' }); done.focus();
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function payCard(d) {
    var P = C.payment;
    return '<div class="paycard">' +
      '<div class="paycard__amount"><small>Amount to pay</small><strong>' + esc(d.amount) + '</strong><span>' + esc(d.itemName) + '</span></div>' +
      '<div class="paycard__body">' +
        (P.qr ? '<div class="paycard__qr"><img src="' + esc(P.qr) + '" alt="DuitNow QR code to pay Growing Minds"><small>Scan with any banking app</small></div>' : '') +
        '<div class="paycard__bank"><p class="paycard__or">Or pay by bank transfer</p><dl>' +
          '<div><dt>Bank</dt><dd>' + esc(P.bank) + '</dd></div>' +
          '<div><dt>Account name</dt><dd>' + esc(P.accountName) + '</dd></div>' +
          '<div><dt>Account number</dt><dd class="paycard__num">' + esc(P.accountNumber) + '</dd></div>' +
        '</dl><button type="button" class="copybtn" data-copy="1">Copy account number</button></div>' +
      '</div>' +
      '<p class="paycard__ref">Payment reference: please write <b>' + esc(d.childName) + '</b></p></div>';
  }
  function payScreen(d, saved) {
    var first = esc(d.parentName.split(' ')[0]), html;
    if (saved) {
      html = '<h2>Thank you, ' + first + '. Your details are saved.</h2><p>Last step: pay to confirm your place.</p>' + payCard(d);
    } else if (num) {
      html = '<h2>Almost done, ' + first + '. Two quick steps.</h2>' +
        '<div class="detailsbox"><p><b>Step 1: Send us your details.</b> Tap the button and press send in WhatsApp. The message is already written for you.</p>' +
        '<a class="btn btn-sun" target="_blank" rel="noopener" href="' + waLink(detailsMessage(d)) + '">Send my details on WhatsApp</a></div>' +
        '<p style="margin:26px 0 12px;"><b>Step 2: Pay ' + esc(d.amount) + '.</b></p>' + payCard(d);
    } else {
      html = '<h2>Almost done, ' + first + '. Pay to confirm your place.</h2>' + payCard(d);
    }
    html += '<p class="paynote">' + esc(item.afterPay || 'We\'ll confirm your place on WhatsApp once your payment arrives.') + '</p>';
    if (num) {
      html += '<p class="paynote">Can\'t pay with the QR code or bank transfer? <a target="_blank" rel="noopener" href="' +
              waLink(HI + "I'm booking " + d.itemName + ' (' + d.amount + ') for ' + d.childName + " but I can't pay by QR or bank transfer. Could you help me?") +
              '">Message us on WhatsApp</a> and we\'ll help.</p>';
    }
    show(html);
  }
  done.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-copy]'); if (!b || !C.payment) return;
    var n = C.payment.accountNumber, ok = function () { b.textContent = 'Copied'; };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(n).then(ok, function () { b.textContent = n; });
    else b.textContent = n;
  });

  function registered(d) {
    var html = '<h2>Thank you, ' + esc(d.parentName.split(' ')[0]) + '. Your registration is received.</h2>' +
               '<p>' + esc(item.afterSubmit) + '</p>';
    if (num) {
      html += '<p class="paynote">Questions in the meantime? <a target="_blank" rel="noopener" href="' +
              waLink(HI + "I've just registered " + d.childName + ' for ' + d.itemName + '.') + '">Message us on WhatsApp</a>.</p>';
    }
    show(html);
  }

  function finishSaved(d) {
    if (item.noPayment) { registered(d); return; }
    var pay = (C.pay || {})[key], html = '<h2>Thank you, ' + esc(d.parentName.split(' ')[0]) + '. Your details are saved.</h2>';
    if (pay) {
      html += '<p>Now the last step: secure payment for <b>' + esc(d.itemName) + '</b> (' + esc(d.amount) + ').</p>' +
              '<p><a class="btn btn-sun" href="' + esc(pay) + '">Continue to payment</a></p>' +
              (item.afterPay ? '<p class="paynote">' + esc(item.afterPay) + '</p>' : '') +
              '<p class="help">Taking you there in a moment…</p>';
      show(html); setTimeout(function () { location.href = pay; }, 1800);
    } else if (C.payment) {
      payScreen(d, true);
    } else if (num) {
      html += '<p>Last step: message us and we\'ll send you the payment details for <b>' + esc(d.itemName) + '</b> (' + esc(d.amount) + ').</p>' +
              '<p><a class="btn btn-sun" target="_blank" rel="noopener" href="' +
              waLink(HI + "I've just filled in the booking form for " + d.itemName + ' (' + d.amount + ') for ' + d.childName + '. Please send me the payment details.') +
              '">Message us to arrange payment</a></p>';
      show(html);
    } else {
      html += '<p>We\'ll be in touch on ' + esc(d.phone) + ' to arrange payment for <b>' + esc(d.itemName) + '</b>.</p>';
      show(html);
    }
  }

  function finishFallback(d) {
    var pay = (C.pay || {})[key];
    if (item.noPayment) {
      var nh = '<h2>Almost done: send your details on WhatsApp</h2>';
      nh += num
        ? '<p>We\'ve written the message for you, so just press send. ' + esc(item.afterSubmit) + '</p>' +
          '<p><a class="btn btn-sun" target="_blank" rel="noopener" href="' + waLink(detailsMessage(d)) + '">Send my details on WhatsApp</a></p>'
        : '<p><b>This site isn\'t fully set up yet.</b> Please contact us directly so we can complete your registration.</p>';
      show(nh); return;
    }
    if (C.payment && !pay) { payScreen(d, false); return; }
    var html = '<h2>Almost done: confirm your booking on WhatsApp</h2>' +
      '<p>Your details are ready to send. We\'ve written the message for you, so just press send and we\'ll confirm your place.</p>';
    if (num) {
      html += '<p><a id="fbWa" class="btn btn-sun" target="_blank" rel="noopener" href="' + waLink(detailsMessage(d)) + '">1. Send my details on WhatsApp</a>';
      html += pay ? '<a id="fbPay" class="btn btn-primary" aria-disabled="true" href="' + esc(pay) + '">2. Continue to payment</a></p>'
                  : C.payment ? '</p><p class="help">Then pay <b>' + esc(d.amount) + '</b> using the QR code or bank details below.</p>' + payPanel(d)
                  : '</p><p class="help">Once we receive it, we\'ll reply with the payment details.</p>';
    } else {
      html += '<p><b>This site isn\'t fully set up yet.</b> Please contact us directly so we can complete your booking.</p>';
    }
    show(html);
    var wa = $('fbWa'), py = $('fbPay');
    if (wa && py) wa.addEventListener('click', function () { py.setAttribute('aria-disabled', 'false'); });
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var first = validate();
    if (first) { first.focus(); first.scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
    if ($('website').value) return;

    var d = {
      item: key, itemName: item.name, amount: item.price,
      choice: item.choice ? $('choice').value : '',
      parentName: $('parentName').value.trim(), phone: $('phone').value.trim(),
      childName: $('childName').value.trim(), childDob: dob.value, childAge: age.value,
      childGender: form.querySelector('input[name=childGender]:checked').value,
      allergies: $('allergies').value.trim(), notes: $('notes').value.trim(),
      healthConsent: 'Yes', photoConsent: $('photoConsent').checked ? 'Yes' : 'No',
      termsVersion: TERMS_VERSION, signedName: $('signedName').value.trim(),
      signedAt: stamp() + ' (local time)  |  ' + new Date().toISOString(),
      signatureImage: $('typedOnly').checked ? 'typed name only' : cv.toDataURL('image/png'),
      page: location.href.split('?')[0], website: ''
    };
    var btn = $('submitBtn'); btn.disabled = true; btn.textContent = 'Saving your details…';

    if (C.formEndpoint) {
      post(C.formEndpoint, d).then(function (ok) { ok ? finishSaved(d) : finishFallback(d); });
    } else {
      finishFallback(d);
    }
  });
})();