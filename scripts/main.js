MicroModal.init({
  awaitCloseAnimation: true,
  awaitOpenAnimation: true,
  disableScroll: true,
});

document.addEventListener("DOMContentLoaded", function () {
  // 全てのカレンダーリンクにクリックイベントを追加
  const dayLinks = document.querySelectorAll(".top-calendar-grid .top-day");
  dayLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      const day = this.getAttribute("data-day");
      loadDailyContent(day);
      MicroModal.close("calendar-modal");
    });
  });

  // 当日の日付を取得
  const today = new Date();
  const currentDay = today.getDate();

  // 12月1日から24日までの場合のみ当日コンテンツを表示
  if (today.getMonth() === 11 && currentDay >= 1 && currentDay <= 24) {
    loadDailyContent(currentDay);
  } else {
    // それ以外の場合はメッセージを表示
    document.getElementById("daily-content").innerHTML =
      "<p>コンテンツは12月1日から公開されます。</p>";
  }

  // コンテンツを読み込む関数
  function loadDailyContent(day) {
    const contentWrapper = document.getElementById("daily-content");

    // ローディング表示
    contentWrapper.innerHTML = "<p>読み込み中...</p>";

    // まず既存のスタイルシートとスクリプトを削除
    removeOldResources();

    // 日付ごとのスタイルシートを追加
    loadStylesheet(`day${day}/style.css`);

    // コンテンツの読み込み
    fetch(`day${day}/index.html`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("コンテンツが見つかりません");
        }
        return response.text();
      })
      .then((data) => {
        // コンテンツを表示
        contentWrapper.innerHTML = data;

        // 日付ごとのJavaScriptを読み込む（存在する場合）
        loadScript(`day${day}/script.js`).catch((err) => {
          console.log("Script not found for this day, continuing without JS");
        });
      })
      .catch((error) => {
        contentWrapper.innerHTML = `<p>エラー: ${error.message}</p>`;
        console.error("Error loading content:", error);
      });
  }

  // 古いリソースを削除する関数
  function removeOldResources() {
    // 動的に追加されたスタイルシートを削除
    document
      .querySelectorAll("link[data-dynamic]")
      .forEach((link) => link.remove());
    // 動的に追加されたスクリプトを削除
    document
      .querySelectorAll("script[data-dynamic]")
      .forEach((script) => script.remove());
  }

  // スタイルシートを読み込む関数
  function loadStylesheet(href) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute("data-dynamic", "true");
    document.head.appendChild(link);

    // スタイルシートの読み込み状態を監視
    return new Promise((resolve, reject) => {
      link.onload = resolve;
      link.onerror = () => {
        console.error(`Failed to load stylesheet: ${href}`);
        reject();
      };
    });
  }

  // スクリプトを読み込む関数
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.setAttribute("data-dynamic", "true");
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }
});
