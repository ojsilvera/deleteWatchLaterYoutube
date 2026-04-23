(function () {
    if (document.getElementById("yt-cleaner-ui")) return;

    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    let isRunning = false;
    let total = 0;
    let removed = 0;

    // ===== UI =====
    const ui = document.createElement("div");
    ui.id = "yt-cleaner-ui";
    Object.assign(ui.style, {
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "260px",
        background: "#0f0f0f",
        color: "white",
        padding: "15px",
        borderRadius: "12px",
        zIndex: 999999
    });

    const status = document.createElement("div");
    const count = document.createElement("div");

    const barContainer = document.createElement("div");
    Object.assign(barContainer.style, {
        background: "#333",
        height: "8px",
        marginTop: "10px"
    });

    const bar = document.createElement("div");
    Object.assign(bar.style, {
        height: "8px",
        width: "0%",
        background: "#00ff99"
    });

    barContainer.appendChild(bar);

    const startBtn = document.createElement("button");
    startBtn.textContent = "▶ Iniciar";

    const stopBtn = document.createElement("button");
    stopBtn.textContent = "⏹ Detener";

    ui.append(status, count, barContainer, startBtn, stopBtn);
    document.body.appendChild(ui);

    function updateUI() {
        count.textContent = `${removed} / ${total}`;
        bar.style.width = total ? (removed / total) * 100 + "%" : "0%";
    }

    function getVideos() {
        return document.querySelectorAll("ytd-playlist-video-renderer");
    }

    async function autoScroll() {
        let lastHeight = 0;

        while (isRunning) {
            window.scrollTo(0, document.documentElement.scrollHeight);
            await delay(1500);

            let newHeight = document.documentElement.scrollHeight;
            if (newHeight === lastHeight) break;
            lastHeight = newHeight;
        }
    }

    // 🔥 NUEVA DETECCIÓN ROBUSTA
    function findRemoveButton() {
        const items = document.querySelectorAll("ytd-menu-service-item-renderer");

        for (let item of items) {
            const label = item.getAttribute("aria-label") || "";
            const text = item.innerText || "";

            const combined = (label + " " + text);

            if (
                combined.includes("Watch later") ||
				combined.includes("watch later") ||
                combined.includes("ver más tarde") ||
                combined.includes("ver mas tarde")
            ) {
                return item;
            }
        }
        return null;
    }

    async function removeVideos() {
        let videos = getVideos();
        total = videos.length;
        removed = 0;

        updateUI();
        status.textContent = "Eliminando...";

        for (let i = 0; i < videos.length; i++) {
            if (!isRunning) break;

            let video = videos[i];

            try {
                const menuBtn = video.querySelector("button[aria-label]");
                if (!menuBtn) continue;

                menuBtn.click();
                await delay(1000);

                const removeBtn = findRemoveButton();

                if (removeBtn) {
                    removeBtn.click();
                    removed++;
                    updateUI();
                } else {
                    console.warn("No se encontró botón eliminar");
                }

                await delay(1200);

            } catch (e) {
                console.warn("Error:", e);
            }
        }

        status.textContent = "Finalizado";
    }

    async function start() {
        if (isRunning) return;

        isRunning = true;
        status.textContent = "Cargando...";

        await autoScroll();
        await removeVideos();
    }

    function stop() {
        isRunning = false;
        status.textContent = "Detenido";
    }

    startBtn.onclick = start;
    stopBtn.onclick = stop;

})();