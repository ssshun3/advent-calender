MicroModal.init({
  awaitCloseAnimation: true,
  awaitOpenAnimation: true,
  disableScroll: true,
});
class IframeManager {
  constructor(iframe) {
    this.iframe = iframe;
    this.setupResizeObserver();
    this.setupMessageListener();
  }
  setupResizeObserver() {
    if (this.iframe.contentDocument) {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          // スクロール高さを取得して設定
          const body = this.iframe.contentDocument.body;
          const html = this.iframe.contentDocument.documentElement;
          const height = Math.max(
            body.scrollHeight,
            body.offsetHeight,
            html.clientHeight,
            html.scrollHeight,
            html.offsetHeight
          );
          this.iframe.style.height = `${height}px`;
        }
      });

      const body = this.iframe.contentDocument.body;
      if (body) {
        this.resizeObserver.observe(body);
      }
    }
  }

  setupMessageListener() {
    window.addEventListener("message", (event) => {
      if (event.source !== this.iframe.contentWindow) return;

      const { type, height } = event.data;
      if (type === "resize") {
        this.iframe.style.height = `${height}px`;
      }
    });
  }

  cleanup() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
}

// カレンダーグリッドの生成
function generateCalendarGrid() {
  const gridContainer = document.querySelector(".top-calendar-grid");
  gridContainer.innerHTML = ""; // Clear existing content

  for (let i = 1; i <= 24; i++) {
    const dayLink = document.createElement("a");
    dayLink.href = "#";
    dayLink.className = "top-day";
    dayLink.setAttribute("data-day", i);
    dayLink.textContent = i;

    // 現在の日付が12月で、この日付がまだ来ていない場合はdisabled
    const today = new Date();
    if (today.getMonth() === 11 && today.getDate() < i) {
      dayLink.style.opacity = "0.5";
      dayLink.style.pointerEvents = "none";
    }

    gridContainer.appendChild(dayLink);
  }
}

// コンテンツ読み込み関数
function loadDailyContent(day) {
  const contentWrapper = document.getElementById("daily-content");
  contentWrapper.innerHTML = "";

  // 古いiframeManagerのクリーンアップ
  if (window.currentIframeManager) {
    window.currentIframeManager.cleanup();
  }

  // iframeコンテナの作成
  const container = document.createElement("div");
  container.className = "iframe-container";

  // ローディング表示
  const loading = document.createElement("div");
  loading.className = "loading";
  loading.textContent = "読み込み中...";
  container.appendChild(loading);

  // iframe作成
  const iframe = document.createElement("iframe");
  iframe.style.width = "100%";
  iframe.style.border = "none";
  iframe.style.opacity = "0";
  iframe.style.transition = "opacity 0.3s";
  iframe.title = `Day ${day} content`;

  // セキュリティ設定
  iframe.sandbox = "allow-scripts allow-same-origin allow-popups";

  // iframe読み込み完了時の処理
  iframe.onload = () => {
    loading.remove();
    iframe.style.opacity = "1";
    window.currentIframeManager = new IframeManager(iframe);
  };

  // エラー処理
  iframe.onerror = () => {
    container.innerHTML = `
      <div class="error-message">
        <p>コンテンツの読み込みに失敗しました。</p>
        <button onclick="loadDailyContent(${day})">再試行</button>
      </div>
    `;
  };

  iframe.src = `day${day}/index.html`;
  container.appendChild(iframe);
  contentWrapper.appendChild(container);
}

// 初期化処理
document.addEventListener("DOMContentLoaded", function () {
  // MicroModalの初期化
  MicroModal.init({
    awaitCloseAnimation: true,
    awaitOpenAnimation: true,
    disableScroll: true,
  });

  // カレンダーグリッドの生成
  generateCalendarGrid();

  // クリックイベントの設定
  document
    .querySelector(".top-calendar-grid")
    .addEventListener("click", function (event) {
      if (event.target.classList.contains("top-day")) {
        event.preventDefault();
        const day = event.target.getAttribute("data-day");
        loadDailyContent(day);
        MicroModal.close("calendar-modal");
      }
    });

  // 現在の日付が12月1日〜24日の場合、該当コンテンツを表示
  const today = new Date();
  const currentDay = today.getDate();
  if (today.getMonth() === 11 && currentDay >= 1 && currentDay <= 24) {
    loadDailyContent(currentDay);
  } else {
    document.getElementById("daily-content").innerHTML =
      '<p class="loading">コンテンツは12月1日から公開されます。</p>';
  }
});

// クリーンアップ
window.addEventListener("beforeunload", () => {
  if (window.currentIframeManager) {
    window.currentIframeManager.cleanup();
  }
});
