(function(){
  const section = document.querySelector('#products-management-section');
  const toggle = document.getElementById('sort-toggle');
  const menu = document.getElementById('sort-menu');
  const label = document.getElementById('sort-label');

  const MAP = {
    relevance: '排序：相关性',
    newest: '排序：最新',
    oldest: '排序：最早',
    name_az: '排序：名称 A → Z',
    name_za: '排序：名称 Z → A'
  };

  function closeMenu(){ 
    if (!menu) return;
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
  }

  if (toggle && menu && section) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = menu.classList.contains('is-open');
      if (isOpen) {
        closeMenu();
      } else {
        menu.classList.add('is-open');
        menu.setAttribute('aria-hidden', 'false');
      }
    });
    menu.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-sort]');
      if (!btn) return;
      const sort = btn.getAttribute('data-sort');
      if (label) label.textContent = MAP[sort] || '排序：相关性';
      closeMenu();
      // 向产品组件派发自定义事件
      section.dispatchEvent(new CustomEvent('sortChanged', { detail: { criterion: sort }}));
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.sort-dropdown')) closeMenu();
    });
  }
})();
