// ============================================================
// ARTICLE SUBMISSION FORM — BEHAVIOR
// Toolbar formatting, link insertion, image upload, and the
// submit handler for submit-article.html.
// Depends on SUBMIT_ENDPOINT from submit-config.js.
// ============================================================

    (function () {
        const editor = document.getElementById('s-editor');
        const toolbar = document.querySelector('.rte-toolbar');

        // Toolbar buttons apply formatting commands to the editor.
        toolbar.addEventListener('click', function (e) {
            const btn = e.target.closest('.rte-btn');
            if (!btn || btn.id === 'rte-image-btn' || btn.id === 'rte-link-btn') return;
            e.preventDefault();
            editor.focus();
            const cmd = btn.getAttribute('data-cmd');
            const value = btn.getAttribute('data-value') || undefined;
            document.execCommand(cmd, false, value);
        });

        // Insert Link: remembers exactly where the cursor was (or
        // what text was selected) before the prompt() dialog steals
        // focus, then drops the link back in that exact spot.
        const linkBtn = document.getElementById('rte-link-btn');

        function getEditorRange() {
            const sel = window.getSelection();
            if (sel.rangeCount > 0 && editor.contains(sel.anchorNode)) {
                return sel.getRangeAt(0).cloneRange();
            }
            return null;
        }

        function normalizeUrl(raw) {
            const url = raw.trim();
            if (!url) return null;
            // Allow relative links, mailto:, and already-schemed URLs
            // through as-is; otherwise assume https://.
            if (/^([a-z][a-z0-9+.-]*:|\/|#)/i.test(url)) return url;
            return 'https://' + url;
        }

        linkBtn.addEventListener('click', function (e) {
            e.preventDefault();

            const range = getEditorRange();
            editor.focus();
            if (range) {
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            }

            const hasSelection = range && !range.collapsed;
            const selectedText = hasSelection ? range.toString() : '';

            const rawUrl = window.prompt('Enter the URL to link to:');
            if (rawUrl === null) return; // cancelled
            const url = normalizeUrl(rawUrl);
            if (!url) return;

            // Restore focus/selection: the URL prompt() may have
            // moved it away from the editor.
            editor.focus();
            if (range) {
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            }

            // Always ask for a title/display text, instead of ever
            // silently falling back to showing the raw URL. If text
            // was selected, that becomes the pre-filled default (and
            // can still be overridden); otherwise it starts blank.
            const rawTitle = window.prompt(
                'Link title (the text readers will see):',
                selectedText
            );
            const title = (rawTitle === null ? selectedText : rawTitle).trim() || url;

            // Restore focus/selection again: the title prompt() also
            // moves it away from the editor.
            editor.focus();
            if (range) {
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            }

            // insertHTML replaces the current selection (if any) or
            // inserts at the cursor (if collapsed) — so this single
            // call handles both cases and lands exactly where the
            // cursor/selection was.
            const safeTitle = title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const safeUrl = url.replace(/"/g, '&quot;');
            document.execCommand('insertHTML', false,
                '<a href="' + safeUrl + '" target="_blank" rel="noopener noreferrer">' + safeTitle + '</a>'
            );
        });

        // Insert Image: uploads the chosen file through the Apps
        // Script backend (which saves it to Drive and hands back a
        // public URL), then inserts it at the cursor position.
        const imageBtn = document.getElementById('rte-image-btn');
        const imageInput = document.getElementById('rte-image-input');
        let savedRange = null;

        imageBtn.addEventListener('click', function (e) {
            e.preventDefault();

            if (typeof SUBMIT_ENDPOINT === 'undefined' || SUBMIT_ENDPOINT.indexOf('PASTE_YOUR') === 0) {
                alert('Image uploads aren\u2019t connected yet \u2014 the site owner still needs to finish setup (see submit-config.js).');
                return;
            }

            // Save where the cursor was, since focus moves away
            // while the file picker is open and during upload.
            const sel = window.getSelection();
            if (sel.rangeCount > 0 && editor.contains(sel.anchorNode)) {
                savedRange = sel.getRangeAt(0).cloneRange();
            }
            imageInput.value = '';
            imageInput.click();
        });

        imageInput.addEventListener('change', function () {
            const file = imageInput.files[0];
            if (!file) return;

            if (!file.type.startsWith('image/')) {
                alert('Please choose an image file.');
                return;
            }
            const maxBytes = 5 * 1024 * 1024; // 5MB
            if (file.size > maxBytes) {
                alert('That image is too large (max 5MB). Please choose a smaller file.');
                return;
            }

            imageBtn.disabled = true;
            imageBtn.textContent = 'Uploading…';

            const reader = new FileReader();
            reader.onload = function () {
                // reader.result looks like "data:image/png;base64,AAAA..."
                const base64 = reader.result.split(',')[1];

                fetch(SUBMIT_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify({
                        action: 'uploadImage',
                        fileName: file.name,
                        mimeType: file.type,
                        fileData: base64
                    })
                })
                    .then(function (res) { return res.json(); })
                    .then(function (data) {
                        if (data.result !== 'success' || !data.url) {
                            throw new Error(data.message || 'Upload failed');
                        }

                        editor.focus();
                        const sel = window.getSelection();
                        sel.removeAllRanges();
                        if (savedRange) {
                            sel.addRange(savedRange);
                        }

                        document.execCommand('insertHTML', false,
                            '<img src="' + data.url + '" alt="' + file.name.replace(/"/g, '&quot;') + '" style="max-width:100%;border-radius:12px;margin:16px 0;display:block;" />'
                        );
                    })
                    .catch(function (err) {
                        alert('Sorry, that image couldn\u2019t be uploaded. Please try again.');
                        console.error(err);
                    })
                    .finally(function () {
                        imageBtn.disabled = false;
                        imageBtn.innerHTML = '&#128247; Image';
                    });
            };
            reader.onerror = function () {
                alert('Couldn\u2019t read that file. Please try again.');
                imageBtn.disabled = false;
                imageBtn.innerHTML = '&#128247; Image';
            };
            reader.readAsDataURL(file);
        });

        const form = document.getElementById('submit-form');
        const statusBox = document.getElementById('submit-status');
        const submitBtn = document.getElementById('submit-btn');

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = document.getElementById('s-name').value.trim();
            const email = document.getElementById('s-email').value.trim();
            const title = document.getElementById('s-title').value.trim();
            const topic = document.getElementById('s-topic').value;
            const summary = document.getElementById('s-summary').value.trim();
            const articleHtml = editor.innerHTML.trim();
            const articleText = editor.textContent.trim();

            if (!name || !email || !title || !topic || !summary || !articleText) {
                statusBox.textContent = 'Please fill in every field before submitting.';
                statusBox.className = 'submit-status-message is-error';
                return;
            }

            if (typeof SUBMIT_ENDPOINT === 'undefined' || SUBMIT_ENDPOINT.indexOf('PASTE_YOUR') === 0) {
                statusBox.textContent = 'Submissions aren\u2019t connected yet \u2014 the site owner still needs to finish setup (see submit-config.js).';
                statusBox.className = 'submit-status-message is-error';
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting…';

            fetch(SUBMIT_ENDPOINT, {
                method: 'POST',
                // text/plain avoids a CORS preflight request, which
                // Apps Script Web Apps don't handle. The server still
                // reads this as JSON.
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ name, email, title, topic, summary, articleHtml })
            })
                .then(function (res) { return res.json(); })
                .then(function (data) {
                    if (data.result === 'success') {
                        form.reset();
                        editor.innerHTML = '';
                        statusBox.textContent = 'Thanks! Your article has been submitted for review.';
                        statusBox.className = 'submit-status-message is-success';
                    } else {
                        throw new Error(data.message || 'Unknown error');
                    }
                })
                .catch(function (err) {
                    statusBox.textContent = 'Something went wrong submitting your article. Please try again, or message us directly.';
                    statusBox.className = 'submit-status-message is-error';
                    console.error(err);
                })
                .finally(function () {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Submit Article <span class="btn-arrow">&rarr;</span>';
                });
        });
    })();