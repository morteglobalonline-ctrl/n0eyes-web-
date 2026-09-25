/* Yasal sayfalar: TR/EN blok değiştirici (ana sitedeki dil seçimini paylaşır) */
(() => {
  const oku = () => { try { return (localStorage.getItem('n0eyes-lang') || sessionStorage.getItem('n0eyes-lang')) === 'en' ? 'en' : 'tr'; } catch { return 'tr'; } };
  const q = new URLSearchParams(location.search).get('lang');
  let dil = q === 'en' || q === 'tr' ? q : oku();
  const uygula = () => {
    document.documentElement.lang = dil;
    document.querySelectorAll('[data-dil]').forEach((el) => el.classList.toggle('is-on', el.dataset.dil === dil));
    document.querySelectorAll('.doc__lang').forEach((b) => { b.textContent = dil === 'tr' ? 'EN' : 'TR'; });
    const t = document.querySelector(`[data-dil="${dil}"] h1`);
    if (t) document.title = `${t.textContent} — n0eyes`;
    try { (window.n0Riza && window.n0Riza() ? localStorage : sessionStorage).setItem('n0eyes-lang', dil); } catch {}
  };
  document.querySelectorAll('.doc__lang').forEach((b) => b.addEventListener('click', () => { dil = dil === 'tr' ? 'en' : 'tr'; uygula(); }));
  uygula();
})();
