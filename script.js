  (function() {
    // ----- THEME -----
    const body = document.body;
    const toggleBtn = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const themeLabel = document.getElementById('themeLabel');
    function setTheme(theme) {
      if (theme === 'dark') { body.classList.add('dark'); themeIcon.className = 'fas fa-sun'; themeLabel.textContent = 'Light'; }
      else { body.classList.remove('dark'); themeIcon.className = 'fas fa-moon'; themeLabel.textContent = 'Dark'; }
      localStorage.setItem('cluck-theme', theme);
    }
    const saved = localStorage.getItem('cluck-theme') || 'light';
    setTheme(saved);
    toggleBtn.addEventListener('click', () => setTheme(body.classList.contains('dark') ? 'light' : 'dark'));

    // ----- PRODUCT DATA (with kg ranges & categories) -----
    const products = [
      { id: 1, name: 'Free-range eggs', price: 6.90, category: 'eggs', kg: '1 doz', badge: 'organic', img: 'yai3.jpeg' },
      { id: 2, name: 'Whole chicken', price: 14.50, category: 'chicken', kg: '1.2–1.8 kg', badge: 'free-range', img: 'kuku2.jpeg' },
      { id: 3, name: 'Chicken breast', price: 11.20, category: 'breast', kg: '0.8–1.2 kg', badge: 'boneless', img: 'kuku3.jpeg' },
      { id: 4, name: 'Egg carton (30 pcs)', price: 9.90, category: 'family', kg: '30 pcs', badge: 'family pack', img: 'yai3.jpeg' },
      { id: 5, name: 'Chicken thighs', price: 12.30, category: 'chicken', kg: '1.0–1.5 kg', badge: 'skin-on', img: 'kuku5.jpeg' },
      { id: 6, name: 'Organic eggs (6 pack)', price: 4.50, category: 'eggs', kg: '6 pcs', badge: 'organic', img: 'yai4.jpeg' },
      { id: 7, name: 'Chicken wings', price: 9.80, category: 'chicken', kg: '0.9–1.2 kg', badge: 'party pack', img: 'kuku7.jpeg' },
      { id: 8, name: 'Family chicken pack', price: 28.90, category: 'family', kg: '2.5–3.2 kg', badge: 'best value', img: 'kuku8.jpeg' },
    ];

    // ----- RENDER PRODUCTS -----
    const grid = document.getElementById('productGrid');
    let currentCategory = 'all';

    function renderProducts(category = 'all') {
      const filtered = category === 'all' ? products : products.filter(p => p.category === category);
      grid.innerHTML = filtered.map(p => `
        <div class="product-card" data-id="${p.id}" data-name="${p.name}" data-price="${p.price}">
          <div class="product-img">
            <img src="${p.img}" alt="${p.name}" onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\\'fas fa-drumstick\\' style=\\'font-size:3rem;color:var(--color-accent);\\'></i>'">
          </div>
          <h3>${p.name}</h3>
          <div class="price">$${p.price.toFixed(2)} <small>/${p.kg}</small></div>
          <span class="badge">${p.badge}</span>
          <button class="btn-add add-to-cart"><i class="fas fa-plus-circle"></i> Add</button>
        </div>
      `).join('');

      document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          const card = this.closest('.product-card');
          if (!card) return;
          const name = card.dataset.name || 'item';
          const price = parseFloat(card.dataset.price) || 0;
          addToCart(name, price);
          this.style.transform = 'scale(0.92)';
          setTimeout(() => this.style.transform = '', 120);
        });
      });
      document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', function(e) {
          if (e.target.closest('.add-to-cart')) return;
          const name = this.dataset.name || 'product';
          showToast(`📦 ${name} — details`);
        });
      });
    }

    // ----- CATEGORY FILTER -----
    const catBtns = document.querySelectorAll('.category-btn');
    catBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        catBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentCategory = this.dataset.category;
        renderProducts(currentCategory);
      });
    });

    // ----- CART -----
    let cart = [];
    const cartCountEl = document.getElementById('cartCount');
    const cartItemsEl = document.getElementById('cartItems');
    const cartTotalEl = document.getElementById('cartTotalPrice');
    const cartPanel = document.getElementById('cartPanel');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartIcon = document.getElementById('cartIcon');
    const closeCartBtn = document.getElementById('closeCart');

    function updateCartUI() {
      const count = cart.length;
      cartCountEl.textContent = count;
      if (cart.length === 0) {
        cartItemsEl.innerHTML = `<div class="empty-cart">🐔 Your cart is empty</div>`;
        cartTotalEl.textContent = '$0.00';
        return;
      }
      let html = '', total = 0;
      cart.forEach((item, index) => {
        total += item.price;
        html += `
          <div class="cart-item">
            <span>${item.name}</span>
            <span class="item-price">$${item.price.toFixed(2)}</span>
            <button class="remove-item" data-index="${index}"><i class="fas fa-trash-alt"></i></button>
          </div>
        `;
      });
      cartItemsEl.innerHTML = html;
      cartTotalEl.textContent = `$${total.toFixed(2)}`;
      document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          const idx = parseInt(this.dataset.index);
          cart.splice(idx, 1);
          updateCartUI();
          showToast('🗑️ Removed');
        });
      });
    }

    function addToCart(name, price) {
      cart.push({ name, price });
      updateCartUI();
      showToast(`✅ ${name} added`);
    }

    function openCart() { cartPanel.classList.add('open'); cartOverlay.classList.add('open'); }
    function closeCart() { cartPanel.classList.remove('open'); cartOverlay.classList.remove('open'); }
    cartIcon.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    // ----- TOAST -----
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMessage');
    let toastTimer = null;
    function showToast(msg) {
      toastMsg.textContent = msg;
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
    }

    // ----- TESTIMONIAL SLIDER (auto) -----
    const track = document.getElementById('testimonialTrack');
    const slides = track.querySelectorAll('.testimonial-slide');
    const dotsContainer = document.getElementById('sliderDots');
    let currentSlide = 0;
    let slideInterval = null;
    const totalSlides = slides.length;

    // Create dots
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
      dot.dataset.index = i;
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    });

    function goToSlide(index) {
      currentSlide = index;
      track.style.transform = `translateX(-${index * 100}%)`;
      document.querySelectorAll('.slider-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
      resetAutoSlide();
    }

    function nextSlide() {
      goToSlide((currentSlide + 1) % totalSlides);
    }

    function resetAutoSlide() {
      if (slideInterval) clearInterval(slideInterval);
      slideInterval = setInterval(nextSlide, 5000);
    }

    // Pause on hover
    const sliderContainer = document.querySelector('.testimonial-slider-container');
    sliderContainer.addEventListener('mouseenter', () => {
      if (slideInterval) clearInterval(slideInterval);
    });
    sliderContainer.addEventListener('mouseleave', resetAutoSlide);

    // Start auto-slide
    resetAutoSlide();

    // ----- OTHER INTERACTIONS -----
    document.getElementById('orderNowBtn').addEventListener('click', () => { openCart(); showToast('🛒 Cart opened'); });
    document.getElementById('learnMoreBtn').addEventListener('click', () => showToast('📖 Farm-to-table story'));
    document.querySelector('.delivery-banner')?.addEventListener('click', () => showToast('🚚 Free delivery anywhere!'));
    document.querySelectorAll('.social i').forEach(icon => {
      icon.addEventListener('click', function() {
        const platform = this.className.split('fa-')[1] || 'social';
        showToast(`📱 Follow us on ${platform}`);
      });
    });
    document.querySelector('.logo')?.addEventListener('click', () => showToast('🐔 Cluck & Co. — fresh since 2026'));
    document.getElementById('checkoutBtn').addEventListener('click', function() {
      if (cart.length === 0) { showToast('🐣 Cart is empty!'); return; }
      showToast('🎉 Order placed! Free delivery.');
      cart = []; updateCartUI(); closeCart();
    });
    document.getElementById('contactSendBtn').addEventListener('click', function() {
      const name = document.getElementById('contactName').value.trim();
      const email = document.getElementById('contactEmail').value.trim();
      const msg = document.getElementById('contactMsg').value.trim();
      if (!name || !email || !msg) { showToast('⚠️ Please fill all fields'); return; }
      showToast('📨 Message sent! We\'ll reply soon.');
      document.getElementById('contactName').value = '';
      document.getElementById('contactEmail').value = '';
      document.getElementById('contactMsg').value = '';
    });

    // FAQ toggle
    document.querySelectorAll('.faq-item').forEach(item => {
      item.addEventListener('click', function() {
        this.classList.toggle('open');
      });
    });

    // initial render
    renderProducts('all');
    updateCartUI();
  })();
