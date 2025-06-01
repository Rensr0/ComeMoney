 // 检查浏览器是否支持Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/js/sw.js')
        .then(registration => {
        })
        .catch(error => {
          console.log('Service Worker 注册失败:', error);
        });
    });
  }