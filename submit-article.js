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

    // ============================================================
    // PASTE CLEANER
    // Strips out foreign fonts, font sizes, colors, and Word/Docs
    // junk while retaining real formatting (h2, h3, bold, lists, etc.)
    // ============================================================
    function cleanPastedHtml(rawHtml) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(rawHtml, 'text/html');
        const body = doc.body;

        // 1. Remove unwanted elements entirely
        const removeSelectors = ['script', 'style', 'meta', 'link', 'xml', 'title'];
        removeSelectors.forEach(function (sel) {
            body.querySelectorAll(sel).forEach(function (el) { el.remove(); });
        });

        // 2. Elements allowed to remain as formatting tags
        const allowedTags = new Set([
            'P', 'H2', 'H3', 'H4', 'B', 'STRONG', 'I', 'EM',
            'U', 'S', 'A', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'IMG', 'BR', 'HR'
        ]);

        function walkAndClean(node) {
            const children = Array.from(node.childNodes);
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                if (child.nodeType === Node.ELEMENT_NODE) {
                    walkAndClean(child);

                    const tag = child.tagName.toUpperCase();
                    if (!allowedTags.has(tag)) {
                        // Unwrap container tags like <span>, <font>, <div>
                        while (child.firstChild) {
                            node.insertBefore(child.firstChild, child);
                        }
                        node.removeChild(child);
                    } else {
                        // Strip all inline styles, classes, fonts, and Microsoft Word attributes
                        if (tag === 'A') {
                            const href = child.getAttribute('href') || '#';
                            while (child.attributes.length > 0) {
                                child.removeAttribute(child.attributes[0].name);
                            }
                            child.setAttribute('href', href);
                            child.setAttribute('target', '_blank');
                            child.setAttribute('rel', 'noopener noreferrer');
                        } else if (tag === 'IMG') {
                            const src = child.getAttribute('src') || '';
                            const alt = child.getAttribute('alt') || '';
                            while (child.attributes.length > 0) {
                                child.removeAttribute(child.attributes[0].name);
                            }
                            child.setAttribute('src', src);
                            child.setAttribute('alt', alt);
                            child.setAttribute('style', 'max-width:100%;border-radius:12px;margin:16px 0;display:block;');
                        } else {
                            while (child.attributes.length > 0) {
                                child.removeAttribute(child.attributes[0].name);
                            }
                        }
                    }
                }
            }
        }

        walkAndClean(body);

        // 3. Clean up empty paragraphs
        let cleaned = body.innerHTML;
        cleaned = cleaned.replace(/<p>\s*(?:&nbsp;|\s)*\s*<\/p>/gi, '');
        return cleaned.trim();
    }

    editor.addEventListener('paste', function (e) {
        e.preventDefault();
        const clipboard = e.clipboardData || window.clipboardData;
        if (!clipboard) return;

        const html = clipboard.getData('text/html');
        const text = clipboard.getData('text/plain');

        if (html) {
            const cleanHtml = cleanPastedHtml(html);
            document.execCommand('insertHTML', false, cleanHtml);
        } else if (text) {
            // Convert multi-line plain text into clean paragraphs
            const paragraphs = text
                .split(/\r?\n\r?\n/)
                .map(function (p) { return p.trim(); })
                .filter(function (p) { return p.length > 0; })
                .map(function (p) { return '<p>' + p.replace(/\r?\n/g, '<br>') + '</p>'; })
                .join('');
            document.execCommand('insertHTML', false, paragraphs || text);
        }
    });

    // ============================================================
    // INSERT LINK
    // ============================================================
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
        if (rawUrl === null) return;
        const url = normalizeUrl(rawUrl);
        if (!url) return;

        editor.focus();
        if (range) {
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }

        const rawTitle = window.prompt('Link title (the text readers will see):', selectedText);
        const title = (rawTitle === null ? selectedText : rawTitle).trim() || url;

        editor.focus();
        if (range) {
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }

        const safeTitle = title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const safeUrl = url.replace(/"/g, '&quot;');
        document.execCommand('insertHTML', false,
            '<a href="' + safeUrl + '" target="_blank" rel="noopener noreferrer">' + safeTitle + '</a>'
        );
    });

    // ============================================================
    // INSERT IMAGE
    // ============================================================
    const imageBtn = document.getElementById('rte-image-btn');
    const imageInput = document.getElementById('rte-image-input');
    let savedRange = null;

    imageBtn.addEventListener('click', function (e) {
        e.preventDefault();

        if (typeof SUBMIT_ENDPOINT === 'undefined' || SUBMIT_ENDPOINT.indexOf('PASTE_YOUR') === 0) {
            alert('Image uploads aren\u2019t connected yet \u2014 the site owner still needs to finish setup (see submit-config.js).');
            return;
        }

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

    // ============================================================
    // SUBMISSION HANDLER
    // ============================================================
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
