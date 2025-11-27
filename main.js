const worker = new Worker("worker.js");

worker.onmessage = (e) => {
    const { left, right } = e.data;
    document.getElementById("left").innerHTML = left;
    document.getElementById("right").innerHTML = right;
};

// Sync scroll
const leftPanel = document.getElementById("left");
const rightPanel = document.getElementById("right");

leftPanel.onscroll = () => {
    rightPanel.scrollTop = leftPanel.scrollTop;
};
rightPanel.onscroll = () => {
    leftPanel.scrollTop = rightPanel.scrollTop;
};

function runDiff() {
    worker.postMessage({
        a: document.getElementById("a").value,
        b: document.getElementById("b").value
    });
}
