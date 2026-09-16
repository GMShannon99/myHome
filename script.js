// ---------------------------------------------------------------------
// Background-persistence approach:
// Each menu item gets its own <iframe>, created lazily the first time
// it's clicked and appended to #content-area. After that it is never
// removed from the DOM again -- switching menu items only toggles the
// CSS "active" class (display: none/block), so every page a user has
// visited (including "My Art Books") keeps running/loaded in the
// background for the rest of the session, and switching back to it is
// instant with no reload.
//
// This relies on the linked sites being embeddable in an iframe. All
// four are plain GitHub Pages sites and (checked via curl -I) none of
// them currently send an X-Frame-Options or Content-Security-Policy
// header, so standard iframe embedding works. If that ever changes on
// one of those repos, its content will simply fail to display here.
// ---------------------------------------------------------------------

const contentArea = document.getElementById('content-area');
const welcomeScreen = document.getElementById('welcome-screen');
const iframes = {};
let activeKey = null;

function showFrame(key, url) {
  welcomeScreen.style.display = 'none';

  Object.values(iframes).forEach((frame) => frame.classList.remove('active'));

  if (!iframes[key]) {
    const iframe = document.createElement('iframe');
    iframe.className = 'content-frame';
    iframe.src = url;
    iframe.title = key;
    contentArea.appendChild(iframe);
    iframes[key] = iframe;
  }

  iframes[key].classList.add('active');
  activeKey = key;
}

// Both the nav dropdown links and the welcome-screen shortcut icons carry
// the same data-key/data-url attributes and share this one click handler,
// so the icons are just additional entry points into the same
// showFrame()/iframe-cache logic -- not a separate loading system.
document.querySelectorAll('[data-url]').forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    showFrame(trigger.dataset.key, trigger.dataset.url);
    closeAllDropdowns();
  });
});

// ---------------------------------------------------------------------
// Click/tap support for dropdowns (in addition to CSS :hover), so the
// nav menu also works on touch devices that have no hover state.
// ---------------------------------------------------------------------

const navItems = document.querySelectorAll('.nav-item');

function closeAllDropdowns() {
  navItems.forEach((item) => {
    item.classList.remove('open');
    item.querySelector('.nav-link').setAttribute('aria-expanded', 'false');
  });
}

navItems.forEach((item) => {
  const button = item.querySelector('.nav-link');
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    const isOpen = item.classList.contains('open');
    closeAllDropdowns();
    if (!isOpen) {
      item.classList.add('open');
      button.setAttribute('aria-expanded', 'true');
    }
  });
});

document.addEventListener('click', closeAllDropdowns);

// ---------------------------------------------------------------------
// "X" button: closes whatever is currently loaded in the content area
// and returns to the welcome screen. It does NOT close the browser tab.
// The active iframe (even the persistent "My Art Books" one) is only
// hidden, not removed, so it stays warm in the background per the
// existing keep-alive behavior -- clicking its shortcut/menu item again
// will show it instantly rather than reloading it.
// If nothing is loaded, this is a no-op.
// ---------------------------------------------------------------------

document.getElementById('close-btn').addEventListener('click', () => {
  if (!activeKey) return;

  iframes[activeKey].classList.remove('active');
  activeKey = null;
  welcomeScreen.style.display = '';
});
