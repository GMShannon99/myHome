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
}

document.querySelectorAll('.dropdown-menu a[data-url]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    showFrame(link.dataset.key, link.dataset.url);
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
// Exit / close button. window.close() only works on windows/tabs that
// were opened by script, so on a normally-navigated GitHub Pages tab
// the browser will silently ignore it. We attempt it anyway, then show
// a fallback message telling the user to close the tab themselves.
// ---------------------------------------------------------------------

document.getElementById('close-btn').addEventListener('click', () => {
  window.close();
  document.getElementById('exit-message').hidden = false;
});
