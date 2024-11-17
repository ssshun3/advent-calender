document.addEventListener("DOMContentLoaded", () => {
  const lightsContainer = document.querySelector(".lights");

  // ライトをランダムに配置
  for (let i = 0; i < 20; i++) {
    const light = document.createElement("div");
    light.className = "light";
    light.style.left = `${Math.random() * 100}%`;
    light.style.top = `${Math.random() * 100}%`;
    lightsContainer.appendChild(light);
  }
});
