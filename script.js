const burgerButton = document.querySelector('.burger');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-menu__link');

if (burgerButton && mobileMenu) {
  burgerButton.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('mobile-menu--open');
    burgerButton.setAttribute('aria-expanded', String(isOpen));
  });

  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('mobile-menu--open');
      burgerButton.setAttribute('aria-expanded', 'false');
    });
  });
}
