/* ============================================
   MOOR DIGITAL MARKETING — Shared JS
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  // Navbar scroll
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    });
    // Trigger on load in case page is already scrolled
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }

  // Mobile toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

  // Scroll animations
  const observerOptions = { threshold: 0.12, rootMargin: '0px 0px -40px 0px' };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, observerOptions);
  document.querySelectorAll('.fade-in,.fade-in-left,.fade-in-right,.convo-step').forEach(el => observer.observe(el));

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // FAQ accordions
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      // Toggle current
      if (!isOpen) item.classList.add('open');
    });
  });

  // Contact form — GoHighLevel webhook
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;
      btn.innerHTML = 'Sending...';
      btn.disabled = true;

      // Collect form data as URL-encoded string
      // (no-cors mode strips Content-Type: application/json,
      //  but allows application/x-www-form-urlencoded)
      const formData = new FormData(contactForm);
      const params = new URLSearchParams();
      formData.forEach((value, key) => { params.append(key, value); });

      try {
        await fetch('https://services.leadconnectorhq.com/hooks/8OxHCYZsjPIzURqMi2pP/webhook-trigger/59578971-58c4-4c90-a2da-8e95cfd14396', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString(),
          mode: 'no-cors'
        });

        // Show success message
        const successDiv = document.getElementById('formSuccess');
        if (successDiv) {
          contactForm.style.display = 'none';
          successDiv.style.display = 'block';
        }
      } catch (err) {
        btn.innerHTML = originalText;
        btn.disabled = false;
        alert('Something went wrong. Please try again or email us directly.');
      }
    });
  }

});
