/**
 * ============================================================================
 * PORTFOLIO SCRIPT: DIVYANSH KUMAR GHUSINGA
 * Features:
 *  - Three.js Interactive 3D Architectural / Blueprint Structure with Parallax
 *  - Performance-optimized WebGL with off-screen pause & capped DPI
 *  - Active Section Scrollspy & Sticky Header
 *  - Mobile Navigation Drawer
 *  - Interactive Photo Placeholder with Local File Upload Preview & Drag-and-Drop
 *  - Reveal-on-Scroll Intersection Observer
 *  - Non-functional Contact Form UX with Toast Notification
 *  - Accessible Keyboard Navigation & Back-to-Top
 * ============================================================================
 */

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
     01. TOAST NOTIFICATION SYSTEM
     -------------------------------------------------------------------------- */
  const toastElement = document.getElementById('toast-notification');
  const toastTitle = document.getElementById('toast-title');
  const toastMessage = document.getElementById('toast-message');
  const toastClose = document.getElementById('toast-close');
  let toastTimer = null;

  function showToast(title, message, duration = 4500) {
    if (!toastElement) return;

    if (toastTitle) toastTitle.textContent = title;
    if (toastMessage) toastMessage.textContent = message;

    toastElement.classList.add('show');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      hideToast();
    }, duration);
  }

  function hideToast() {
    if (!toastElement) return;
    toastElement.classList.remove('show');
    if (toastTimer) {
      clearTimeout(toastTimer);
      toastTimer = null;
    }
  }

  if (toastClose) {
    toastClose.addEventListener('click', hideToast);
  }

  /* --------------------------------------------------------------------------
     02. THREE.JS 3D ARCHITECTURAL / BLUEPRINT STRUCTURE
     -------------------------------------------------------------------------- */
  function initThreeHero() {
    const canvas = document.getElementById('three-architectural-canvas');
    const container = document.getElementById('hero-three-container');

    if (!canvas || !container || typeof THREE === 'undefined') {
      console.warn('Three.js or hero canvas container not found.');
      return;
    }

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06070a, 0.035);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.8, 8.5);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);

    // Group for the entire architectural model
    const architectureGroup = new THREE.Group();
    scene.add(architectureGroup);

    // Color definitions
    const cobaltBlue = 0x2563eb;
    const vividViolet = 0x7c3aed;
    const brightCyan = 0x22d3ee;
    const darkGraphite = 0x1e293b;

    /* 1. Generative Wireframe Skyscraper / Architectural Pavilion */
    const towerGroup = new THREE.Group();
    const levels = 8;
    const levelHeight = 0.55;

    for (let i = 0; i < levels; i++) {
      const scale = 1 - (i * 0.08);
      const width = 1.6 * scale;
      const height = levelHeight;
      const depth = 1.6 * scale;

      // Box Geometry wireframe edges
      const boxGeo = new THREE.BoxGeometry(width, height, depth);
      const wireframeGeo = new THREE.EdgesGeometry(boxGeo);
      
      // Alternating colors between cobalt and violet
      const wireColor = i % 2 === 0 ? cobaltBlue : vividViolet;
      const wireMat = new THREE.LineBasicMaterial({
        color: wireColor,
        transparent: true,
        opacity: 0.55 + (i * 0.04),
        linewidth: 1
      });

      const wireframe = new THREE.LineSegments(wireframeGeo, wireMat);
      wireframe.position.y = (i * levelHeight) - (levels * levelHeight * 0.4);
      wireframe.rotation.y = (i * 0.12);
      towerGroup.add(wireframe);

      // Add architectural structural truss diagonals for selected levels
      if (i % 2 === 1) {
        const diagGeo = new THREE.BufferGeometry();
        const halfW = width / 2;
        const halfD = depth / 2;
        const halfH = height / 2;
        const pts = [
          new THREE.Vector3(-halfW, -halfH, -halfD), new THREE.Vector3(halfW, halfH, halfD),
          new THREE.Vector3(halfW, -halfH, -halfD), new THREE.Vector3(-halfW, halfH, halfD)
        ];
        diagGeo.setFromPoints(pts);
        const diagMat = new THREE.LineBasicMaterial({
          color: brightCyan,
          transparent: true,
          opacity: 0.35
        });
        const diagLines = new THREE.LineSegments(diagGeo, diagMat);
        diagLines.position.copy(wireframe.position);
        diagLines.rotation.y = wireframe.rotation.y;
        towerGroup.add(diagLines);
      }
    }

    // Central core spire
    const spireGeo = new THREE.CylinderGeometry(0.02, 0.08, 5.2, 8);
    const spireMat = new THREE.MeshBasicMaterial({
      color: brightCyan,
      wireframe: true,
      transparent: true,
      opacity: 0.7
    });
    const spire = new THREE.Mesh(spireGeo, spireMat);
    spire.position.y = 0.5;
    towerGroup.add(spire);

    // Position the architectural structure slightly to the right side of the screen
    towerGroup.position.set(1.4, -0.2, 0);
    architectureGroup.add(towerGroup);

    /* 2. Topographic & Blueprint Ground Grid */
    const gridHelper = new THREE.GridHelper(24, 28, cobaltBlue, 0x141b2b);
    gridHelper.position.y = -2.2;
    // Set material opacity
    if (gridHelper.material) {
      gridHelper.material.transparent = true;
      gridHelper.material.opacity = 0.4;
    }
    architectureGroup.add(gridHelper);

    /* 3. Topographic Elevation Contour Rings */
    const ringsGroup = new THREE.Group();
    const numRings = 5;
    for (let r = 0; r < numRings; r++) {
      const radius = 2.5 + (r * 1.1);
      const ringGeo = new THREE.RingGeometry(radius, radius + 0.02, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: r % 2 === 0 ? brightCyan : vividViolet,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.15 - (r * 0.02)
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = -2.15 + (r * 0.08);
      ringsGroup.add(ringMesh);
    }
    ringsGroup.position.x = 1.4;
    architectureGroup.add(ringsGroup);

    /* 4. Floating Particles (Spatial Coordinate Dust) */
    const particleCount = 280;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const c1 = new THREE.Color(cobaltBlue);
    const c2 = new THREE.Color(vividViolet);
    const c3 = new THREE.Color(brightCyan);

    for (let p = 0; p < particleCount; p++) {
      positions[p * 3] = (Math.random() - 0.5) * 16;
      positions[p * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[p * 3 + 2] = (Math.random() - 0.5) * 14;

      const choice = Math.random();
      const col = choice < 0.4 ? c1 : choice < 0.75 ? c2 : c3;
      colors[p * 3] = col.r;
      colors[p * 3 + 1] = col.g;
      colors[p * 3 + 2] = col.b;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    /* Mouse Parallax Tracking with Lerp Smoothing */
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    function onMouseMove(event) {
      mouseX = (event.clientX - windowHalfX) * 0.0006;
      mouseY = (event.clientY - windowHalfY) * 0.0006;
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // Touch support for gentle mobile parallax
    function onTouchMove(event) {
      if (event.touches.length > 0) {
        mouseX = (event.touches[0].clientX - windowHalfX) * 0.0004;
        mouseY = (event.touches[0].clientY - windowHalfY) * 0.0004;
      }
    }
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    /* Responsive Resize Listener */
    function onWindowResize() {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Adjust architectural group offset for smaller screens
      if (width < 992) {
        towerGroup.position.set(0, -0.6, -1);
        ringsGroup.position.x = 0;
      } else {
        towerGroup.position.set(1.4, -0.2, 0);
        ringsGroup.position.x = 1.4;
      }
    }
    window.addEventListener('resize', onWindowResize);
    onWindowResize();

    /* Render Loop with Visibility Check */
    let isHeroVisible = true;
    let animationFrameId = null;

    const heroSection = document.getElementById('hero');
    if ('IntersectionObserver' in window && heroSection) {
      const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          isHeroVisible = entry.isIntersecting;
          if (isHeroVisible && !animationFrameId) {
            animate();
          }
        });
      }, { threshold: 0.05 });
      heroObserver.observe(heroSection);
    }

    let clock = new THREE.Clock();

    function animate() {
      if (!isHeroVisible) {
        animationFrameId = null;
        return;
      }

      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth Lerp Damping
      targetX += (mouseX - targetX) * 0.04;
      targetY += (mouseY - targetY) * 0.04;

      // Gentle continuous rotation
      towerGroup.rotation.y = (elapsedTime * 0.15) + (targetX * 1.5);
      towerGroup.rotation.x = (targetY * 0.8) + (Math.sin(elapsedTime * 0.4) * 0.03);

      ringsGroup.rotation.z = elapsedTime * 0.08;

      // Gentle floating heave
      towerGroup.position.y = (window.innerWidth < 992 ? -0.6 : -0.2) + Math.sin(elapsedTime * 0.8) * 0.08;

      // Particle subtle drift
      particleSystem.rotation.y = elapsedTime * 0.03;
      particleSystem.rotation.x = Math.sin(elapsedTime * 0.02) * 0.1;

      // Camera parallax
      camera.position.x = targetX * 1.2;
      camera.position.y = 1.8 - (targetY * 1.2);
      camera.lookAt(towerGroup.position.x * 0.5, 0, 0);

      renderer.render(scene, camera);
    }

    animate();
  }

  /* --------------------------------------------------------------------------
     03. NAVBAR SCROLL & ACTIVE SECTION SCROLLSPY
     -------------------------------------------------------------------------- */
  function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const drawerLinks = document.querySelectorAll('.drawer-link');
    const sections = document.querySelectorAll('section[data-nav-target]');
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const drawerOverlay = document.getElementById('drawer-overlay');
    const backToTopBtn = document.getElementById('back-to-top-btn');

    // Sticky nav blur on scroll
    function handleScroll() {
      const scrollPos = window.scrollY;

      if (navbar) {
        if (scrollPos > 30) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }

      // Back to top visibility
      if (backToTopBtn) {
        if (scrollPos > 400) {
          backToTopBtn.style.opacity = '1';
          backToTopBtn.style.pointerEvents = 'auto';
        } else {
          backToTopBtn.style.opacity = '0.5';
        }
      }

      // Active Section Highlighter
      let currentSectionId = 'hero';
      const offset = 140;

      sections.forEach((sec) => {
        const top = sec.offsetTop - offset;
        const height = sec.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          currentSectionId = sec.getAttribute('data-nav-target');
        }
      });

      navLinks.forEach((link) => {
        if (link.getAttribute('data-section') === currentSectionId) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      drawerLinks.forEach((link) => {
        if (link.getAttribute('data-section') === currentSectionId) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Mobile Drawer Toggle
    function toggleDrawer(open) {
      if (!mobileDrawer || !mobileToggle) return;
      const isOpen = open !== undefined ? open : !mobileDrawer.classList.contains('open');

      if (isOpen) {
        mobileDrawer.classList.add('open');
        mobileToggle.classList.add('open');
        mobileToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
      } else {
        mobileDrawer.classList.remove('open');
        mobileToggle.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    }

    if (mobileToggle) {
      mobileToggle.addEventListener('click', () => toggleDrawer());
    }

    if (drawerOverlay) {
      drawerOverlay.addEventListener('click', () => toggleDrawer(false));
    }

    // Close drawer when any link is clicked
    drawerLinks.forEach((link) => {
      link.addEventListener('click', () => toggleDrawer(false));
    });

    // Close drawer on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileDrawer && mobileDrawer.classList.contains('open')) {
        toggleDrawer(false);
      }
    });

    // Back to top button action
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }

    // Smooth Anchor Scrolling with precise header offset
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#' || href.length <= 1) return;

        const targetEl = document.querySelector(href);
        if (targetEl) {
          e.preventDefault();
          const headerOffset = 70;
          const elementPosition = targetEl.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     04. INTERACTIVE PHOTO PLACEHOLDER
     -------------------------------------------------------------------------- */
  function initPhotoPlaceholder() {
    const portraitFrame = document.getElementById('portrait-frame');
    const fileInput = document.getElementById('portrait-file-input');
    const previewImg = document.getElementById('portrait-preview-img');
    const defaultArt = document.getElementById('frame-default-art');
    const resetBtn = document.getElementById('portrait-reset-btn');

    if (!portraitFrame || !fileInput || !previewImg || !defaultArt) return;

    // Trigger file chooser when clicked
    portraitFrame.addEventListener('click', (e) => {
      if (e.target === resetBtn) return;
      fileInput.click();
    });

    // Keyboard support: Enter or Space triggers upload
    portraitFrame.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fileInput.click();
      }
    });

    // Drag-and-drop handling
    ['dragenter', 'dragover'].forEach((eventName) => {
      portraitFrame.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        portraitFrame.style.borderColor = 'var(--cyan-light)';
        portraitFrame.style.boxShadow = '0 0 25px rgba(34, 211, 238, 0.4)';
      }, false);
    });

    ['dragleave', 'drop'].forEach((eventName) => {
      portraitFrame.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        portraitFrame.style.borderColor = '';
        portraitFrame.style.boxShadow = '';
      }, false);
    });

    portraitFrame.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files && files.length > 0 && files[0].type.startsWith('image/')) {
        handleImageFile(files[0]);
      }
    });

    // File input change
    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files[0]) {
        handleImageFile(fileInput.files[0]);
      }
    });

    function handleImageFile(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImg.src = e.target.result;
        previewImg.classList.remove('hidden');
        defaultArt.style.display = 'none';
        if (resetBtn) resetBtn.classList.remove('hidden');

        showToast('Photo Preview Loaded', 'Your portrait has been previewed inside the architectural frame.');
      };
      reader.readAsDataURL(file);
    }

    // Reset button
    if (resetBtn) {
      resetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        previewImg.src = '';
        previewImg.classList.add('hidden');
        defaultArt.style.display = 'flex';
        resetBtn.classList.add('hidden');
        fileInput.value = '';
        showToast('Photo Placeholder Reset', 'Frame restored to architectural blueprint graphic.');
      });
    }
  }

  /* --------------------------------------------------------------------------
     05. REVEAL-ON-SCROLL ANIMATIONS
     -------------------------------------------------------------------------- */
  function initRevealOnScroll() {
    const revealElements = document.querySelectorAll('[data-reveal]');

    if (!('IntersectionObserver' in window)) {
      revealElements.forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = el.getAttribute('data-delay') || 0;

          setTimeout(() => {
            el.classList.add('is-revealed');
          }, delay);

          obs.unobserve(el);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    });

    revealElements.forEach((el) => observer.observe(el));
  }

  /* --------------------------------------------------------------------------
     06. CONTACT FORM & INTERACTIVE PREVIEWS
     -------------------------------------------------------------------------- */
  function initContactForm() {
    const contactForm = document.getElementById('portfolio-contact-form');
    const mockSubmitBtn = document.getElementById('mock-submit-btn');
    const formStatusMsg = document.getElementById('form-status-msg');

    function triggerNotice() {
      showToast(
        'Contact Form Coming Soon',
        'Direct messaging will be enabled shortly. Please connect on LinkedIn or GitHub!'
      );
      if (formStatusMsg) {
        formStatusMsg.textContent = 'Status: Form integration coming soon. Use LinkedIn / GitHub.';
        formStatusMsg.style.color = 'var(--cyan-light)';
      }
    }

    if (mockSubmitBtn) {
      mockSubmitBtn.addEventListener('click', triggerNotice);
    }

    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        triggerNotice();
      });
    }

    // Sample AI prompt chips
    const sampleChips = document.querySelectorAll('.sample-chip');
    sampleChips.forEach((chip) => {
      chip.addEventListener('click', function () {
        const text = this.textContent.replace(/[“”]/g, '').trim();
        showToast('Botpress AI Assistant', `Simulated Query: "${text}" — Botpress integration initializing soon.`);
      });
    });
  }

  /* --------------------------------------------------------------------------
     07. INITIALIZATION ON DOM READY
     -------------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initThreeHero();
    initPhotoPlaceholder();
    initRevealOnScroll();
    initContactForm();

    console.log(
      '%c DIVYANSH KUMAR GHUSINGA %c Civil Engineering & Future Tech Portfolio %c',
      'background: #2563eb; color: #fff; font-weight: bold; padding: 4px 8px; border-radius: 4px 0 0 4px;',
      'background: #7c3aed; color: #fff; padding: 4px 8px; border-radius: 0 4px 4px 0;',
      'background: transparent;'
    );
  });
})();
