// debug-boot.js — Load dau tien, bat moi loi renderer
window.addEventListener('error', function(ev) {
  var msg = '[BOOT-ERR] ' + ev.message + ' at ' + (ev.filename||'?') + ':' + ev.lineno;
  document.title = msg;
  var d = document.createElement('pre');
  d.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#1a0000;color:#ff6b6b;padding:16px;font-size:13px;white-space:pre-wrap;max-height:50vh;overflow:auto';
  d.textContent = msg + '\n' + (ev.error && ev.error.stack || '');
  document.body.appendChild(d);
});
window.addEventListener('unhandledrejection', function(ev) {
  var msg = '[BOOT-REJECT] ' + (ev.reason && ev.reason.message || ev.reason);
  document.title = msg;
  var d = document.createElement('pre');
  d.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#1a0000;color:#ff6b6b;padding:16px;font-size:13px;white-space:pre-wrap;max-height:50vh;overflow:auto';
  d.textContent = msg + '\n' + (ev.reason && ev.reason.stack || '');
  document.body.appendChild(d);
});
console.log('[debug-boot] error handlers installed');
