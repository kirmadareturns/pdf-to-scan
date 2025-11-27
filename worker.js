importScripts("https://unpkg.com/diff-match-patch@1.0.5/index.js");

const dmp = new diff_match_patch();

onmessage = function (e) {
    const { a, b } = e.data;

    const diffs = dmp.diff_main(a, b);
    dmp.diff_cleanupSemantic(diffs);

    let leftHTML = "";
    let rightHTML = "";

    diffs.forEach(([type, text]) => {
        const safe = escapeHtml(text);

        if (type === 0) {
            leftHTML += `<span class="same">${safe}</span>`;
            rightHTML += `<span class="same">${safe}</span>`;
        } else if (type === -1) {
            leftHTML += `<span class="removed">${safe}</span>`;
        } else if (type === 1) {
            rightHTML += `<span class="added">${safe}</span>`;
        }
    });

    postMessage({ left: leftHTML, right: rightHTML });
};

function escapeHtml(t) {
    return t.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
}
