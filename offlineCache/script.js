window.addEventListener("load", event => {
  // 判断浏览器是否支持
  if ("serviceWorker" in navigator) {
    console.log("支持");
    window.navigator.serviceWorker
      .register("/sw.js", {
        scope: "/"
      })
      .then(registration => {
        registration.update();
        console.log(11111);
        console.log("注册成功", registration.scope);
      })
      .catch(error => {
        console.log("注册失败", error.message);
      });
  } else {
    console.log("不支持");
  }
});