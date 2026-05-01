// ===================== CUSTOM CENTERED ALERT =====================
function centeredAlert(message) {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
  `;
  
  // Create alert box
  const alertBox = document.createElement('div');
  alertBox.style.cssText = `
    background: white;
    padding: 20px 30px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    max-width: 80%;
    text-align: center;
    font-family: var(--font-body);
    font-size: 16px;
    font-weight: 600;
    color: var(--black);
    animation: slideIn 0.3s ease-out;
  `;
  
  alertBox.textContent = message;
  overlay.appendChild(alertBox);
  
  // Add animation keyframe
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(style);
  
  // Add to page
  document.body.appendChild(overlay);
  
  // Remove on click or after 3 seconds
  const removeAlert = () => {
    document.body.removeChild(overlay);
    document.head.removeChild(style);
  };
  
  overlay.addEventListener('click', removeAlert);
  setTimeout(removeAlert, 3000);
}

// ===================== STATE =====================
const state = {
  currentScreen: 'splash',
  role: null,
  orderType: null,
  currentCategory: 'rice',
  cart: [],
  paymentMethod: null,
  orderNumber: null,
  staffTab: 'preparing',
  users: [],
  preparingOrders: [
    { num: '004', items: [{ name: 'Strawberry Cheesecake', qty: 1 }] },
    { num: '005', items: [{ name: 'Pork Menudo with Rice', qty: 1 }, { name: 'Iced Tea', qty: 1 }] },
    { num: '006', items: [{ name: 'Churros', qty: 2 }] },
    { num: '007', items: [{ name: 'Free Soup', qty: 1 }] },
  ],
  readyOrders: [
    { num: '001', items: [{ name: 'Siopao', qty: 2 }, { name: 'Fresh Buko Juice', qty: 2 }] },
    { num: '002', items: [{ name: 'Kare-Kare with Rice', qty: 1 }, { name: 'Iced Tea', qty: 1 }] },
    { num: '003', items: [{ name: 'Mango Sago', qty: 1 }] },
  ],
  claimOrders: [],
  doneOrders: [],
  auditOrders: [
    { date: '01/13/26 9:10am', num: '001', items: ['Iced Tea', 'Burger', 'Cheesecake'] },
    { date: '01/13/2026 9:16am', num: '002', items: ['Iced Tea', 'Burger', 'Cheesecake'] },
    { date: '01/13/2026 9:17', num: '003', items: ['Pastil', 'Buko Juice', 'Halo-Halo'] },
    { date: '01/13/2026 9:50am', num: '004', items: ['Menudo', 'Water'] },
  ],
  auditPayments: [],
};

let nextOrderNum = 1;

// ===================== SCREEN NAVIGATION =====================
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('screen-' + name);
  if (el) el.classList.add('active');
  state.currentScreen = name;

  if (name === 'cart') renderCart();
  if (name === 'checkout') renderCheckout();
  if (name === 'order-number') renderOrderNumber();
  if (name === 'staff-orders') renderStaffOrders();
  if (name === 'order-board') renderOrderBoard();
  if (name === 'order-status') renderOrderStatus();
  if (name === 'audit-orders') renderAuditOrders();
  if (name === 'audit-payment') renderAuditPayments();
}

// ===================== CATEGORY SWITCHING =====================
function showCategory(category) {
  state.currentCategory = category;
  
  // Hide all categories
  document.querySelectorAll('.menu-category').forEach(cat => {
    cat.style.display = 'none';
  });
  
  // Show selected category
  const selectedCat = document.querySelector(`[data-category="${category}"]`);
  if (selectedCat) {
    selectedCat.style.display = 'block';
  }
  
  // Update sidebar active state
  document.querySelectorAll('.sidebar-item').forEach(item => {
    item.classList.toggle('active', item.dataset.cat === category);
  });
  
  // Update title
  const titles = { rice: 'RICE MEAL', drinks: 'DRINKS', snacks: 'SNACKS', desserts: 'DESSERTS' };
  document.getElementById('menu-cat-title').textContent = titles[category] || '';
}

// ===================== QUANTITY CONTROL =====================
function changeQty(id, delta) {
  const item = document.querySelector(`[data-id="${id}"]`);
  if (!item) return;
  
  const name = item.dataset.name;
  const price = parseInt(item.dataset.price);
  const qtyElement = document.getElementById(`qty-${id}`);
  let currentQty = parseInt(qtyElement.textContent) || 0;
  let newQty = Math.max(0, currentQty + delta);
  
  qtyElement.textContent = newQty;
  
  // Update cart
  const cartIndex = state.cart.findIndex(c => c.id === id);
  if (newQty === 0) {
    if (cartIndex > -1) state.cart.splice(cartIndex, 1);
  } else {
    if (cartIndex > -1) {
      state.cart[cartIndex].qty = newQty;
    } else {
      state.cart.push({ id, name, price, qty: newQty });
    }
  }
  
  updateCartBadge();
}

function updateCartBadge() {
  const totalItems = state.cart.reduce((sum, item) => sum + item.qty, 0);
  const badge = document.getElementById('cart-badge');
  if (totalItems > 0) {
    badge.textContent = totalItems;
    badge.style.display = 'inline-block';
  } else {
    badge.style.display = 'none';
  }
}

function selectRole(chip) {
  document.querySelectorAll('.role-chip').forEach(c => c.classList.remove('selected'));
  chip.classList.add('selected');
}

function handleLogin() {
  const username = document.getElementById('login-username').value.trim();
  const id = document.getElementById('login-id').value.trim();
  const role = document.querySelector('.role-chip.selected')?.dataset.role;
  const errorEl = document.getElementById('login-error');

  if (!username || !id || !role) {
    errorEl.textContent = '⚠️ Please fill all fields and select your role';
    return;
  }

  if (username.length < 3) {
    errorEl.textContent = '⚠️ Username must be at least 3 characters long';
    return;
  }

  state.role = role;
  
  // Canteen staff goes directly to staff orders, others go to order flow
  if (role === 'staff') {
    showScreen('staff-orders');
  } else {
    showScreen('order-type');
  }
}

function handleSignup() {
  const fullname = document.getElementById('signup-fullname').value.trim();
  const username = document.getElementById('signup-username').value.trim();
  const id = document.getElementById('signup-id').value.trim();
  const role = document.querySelector('.role-chip.selected')?.dataset.role;
  const errorEl = document.getElementById('signup-error');

  if (!fullname || !username || !id || !role) {
    errorEl.textContent = '⚠️ Please fill all fields and select your role';
    return;
  }

  if (username.length < 3) {
    errorEl.textContent = '⚠️ Username must be at least 3 characters long';
    return;
  }

  state.users.push({ role, fullname, username, id });
  state.role = role;
  
  // Canteen staff goes directly to staff orders, others go to order flow
  if (role === 'staff') {
    showScreen('staff-orders');
  } else {
    showScreen('order-type');
  }
}

function selectOrderType(type) {
  state.orderType = type;
  showScreen('category');
}

function selectCategory(category) {
  state.currentCategory = category;
  showScreen('menu');
  showCategory(category);
}

function selectPayment(method) {
  state.paymentMethod = method;
  
  // Remove selected class from all options
  document.querySelectorAll('.payment-option').forEach(opt => {
    opt.classList.remove('selected');
  });
  
  // Add selected class to chosen option
  const selectedOption = document.querySelector(`[data-method="${method}"]`);
  if (selectedOption) {
    selectedOption.classList.add('selected');
  }
  
  // Update radio buttons
  document.querySelectorAll('.payment-radio').forEach(radio => {
    radio.classList.remove('selected');
  });
  
  const selectedRadio = document.getElementById(`radio-${method}`);
  if (selectedRadio) {
    selectedRadio.classList.add('selected');
  }
}

function paymentProceed() {
  if (!state.paymentMethod) {
    centeredAlert('💳 Please select your preferred payment method to continue.');
    return;
  }
  
  if (state.paymentMethod === 'cash') {
    showScreen('order-number');
  } else if (state.paymentMethod === 'gcash') {
    showScreen('gcash');
  }
}

function gcashNext() {
  showScreen('order-number');
}

function orderNumberDone() {
  showScreen('thankyou');
}

function thankyouDone() {
  if (state.role === 'staff') {
    showScreen('staff-orders');
  } else {
    showScreen('order-status');
  }
}

function claimOrder() {
  if (state.orderNumber) {
    const idx = state.readyOrders.findIndex(o => o.num === state.orderNumber);
    if (idx >= 0) {
      state.doneOrders.push(state.readyOrders.splice(idx, 1)[0]);
      centeredAlert(`🎉 Order ${state.orderNumber} successfully claimed! Enjoy your meal!`);
    } else {
      centeredAlert(`❌ Order ${state.orderNumber} not found in ready orders.`);
    }
    state.orderNumber = null;
  } else {
    centeredAlert('📋 No order number to claim.');
  }
  showScreen('auth');
}

function switchStaffTab(tab) {
  state.staffTab = tab;
  renderStaffOrders();
}

function boardClaim() {
  // Claim from ready orders first
  if (state.readyOrders.length > 0) {
    const o = state.readyOrders.shift();
    state.claimOrders.push(o);
    renderOrderBoard();
    renderStaffOrders();
    centeredAlert(`📋 Order ${o.num} moved to To Claim section!`);
    return;
  }
  
  // Then claim from to claim orders (one by one) - no confusing message
  if (state.claimOrders.length > 0) {
    const o = state.claimOrders.shift();
    state.doneOrders.push(o);
    renderOrderBoard();
    renderStaffOrders();
    centeredAlert(`🎉 Order ${o.num} successfully claimed and completed!`);
    return;
  }
  
  centeredAlert('📭 No orders available to claim at the moment.');
}

function checkoutProceed() {
  if (state.cart.length === 0) { 
    centeredAlert('🛒 Your cart is empty! Please add some delicious items first.'); 
    return; 
  }
  showScreen('checkout');
}

// ===================== CART =====================
function renderCart() {
  const container = document.getElementById('cart-items');
  container.innerHTML = '';
  state.cart.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <span class="cart-item-name">${item.name}</span>
      <span class="cart-item-price">₱${item.price * item.qty}</span>
      <div class="cart-qty-control">
        <button class="cart-qty-btn" onclick="changeQty('${item.id}', -1)">−</button>
        <span style="font-weight:800;min-width:24px;text-align:center;">${item.qty}</span>
        <button class="cart-qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
      </div>
    `;
    container.appendChild(div);
  });

  const total = state.cart.reduce((s, c) => s + c.price * c.qty, 0);
  document.getElementById('cart-total-amount').textContent = '₱' + total;
}

// ===================== CHECKOUT =====================
function renderCheckout() {
  const container = document.getElementById('checkout-items');
  container.innerHTML = '';
  state.cart.forEach(item => {
    const div = document.createElement('div');
    div.className = 'checkout-item';
    div.innerHTML = `
      <div>${item.name} x${item.qty}</div>
      <div>₱${item.price * item.qty}</div>
    `;
    container.appendChild(div);
  });

  const total = state.cart.reduce((s, c) => s + c.price * c.qty, 0);
  document.getElementById('checkout-total-amount').textContent = '₱' + total;
}

// ===================== ORDER NUMBER =====================
function renderOrderNumber() {
  const orderNum = String(nextOrderNum++).padStart(3, '0');
  state.orderNumber = orderNum;
  document.getElementById('order-num-display').textContent = orderNum;
  document.getElementById('thankyou-order-num').textContent = `Order #${orderNum}`;
  
  // Calculate total
  const total = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  
  // Add to audit orders
  const now = new Date();
  const dateStr = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear().toString().slice(-2)} ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
  state.auditOrders.push({
    date: dateStr,
    num: orderNum,
    items: state.cart.map(item => item.name)
  });
  
  // Add to audit payments
  state.auditPayments.push({
    date: dateStr,
    orderNum: orderNum,
    paymentMethod: state.paymentMethod || 'cash',
    total: total,
    items: state.cart.map(item => `${item.name} x${item.qty}`)
  });
  
  // Add to preparing orders
  state.preparingOrders.push({
    num: orderNum,
    items: state.cart.map(item => ({ name: item.name, qty: item.qty }))
  });
  
  // Clear cart
  state.cart = [];
  updateCartBadge();
}

// ===================== STAFF FUNCTIONS =====================
document.getElementById('btn-status-claim').addEventListener('click', () => {
  if (state.orderNumber) {
    centeredAlert(`Order ${state.orderNumber} marked as claimed!`);
    // Move from ready to done if present
    const idx = state.readyOrders.findIndex(o => o.num === state.orderNumber);
    if (idx >= 0) {
      state.doneOrders.push(state.readyOrders.splice(idx, 1)[0]);
    }
    state.orderNumber = null;
    showScreen('auth');
  } else {
    showScreen('auth');
  }
});

// ===================== STAFF SCREENS =====================
document.getElementById('btn-staff-audit').addEventListener('click', () => {
  renderAuditOrders();
  showScreen('audit-orders');
});
document.getElementById('btn-staff-board').addEventListener('click', () => {
  renderOrderBoard();
  showScreen('order-board');
});
document.getElementById('btn-staff-done').addEventListener('click', () => showScreen('auth'));

// Board
document.getElementById('btn-board-back').addEventListener('click', () => showScreen('staff-orders'));

// Audit navigation
document.getElementById('btn-audit-orders-next').addEventListener('click', () => {
  renderAuditPayments();
  showScreen('audit-payment');
});
document.getElementById('btn-audit-payment-done').addEventListener('click', () => showScreen('staff-orders'));

// Staff order tab switching
document.querySelectorAll('.staff-tab-btn').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.staff-tab-btn').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    state.staffTab = tab.dataset.tab;
    renderStaffOrders();
  });
});

function renderStaffOrders() {
  state.staffTab = state.staffTab || 'done';

  // Sync active tab button
  document.querySelectorAll('.staff-tab-btn').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === state.staffTab);
  });

  // Update label
  const labels = { done: 'Done Orders', claim: 'To Claim', ready: 'Ready Orders', preparing: 'Preparing Orders' };
  document.getElementById('staff-active-tab-label').textContent = labels[state.staffTab] || '';

  const container = document.getElementById('staff-order-list');
  container.innerHTML = '';

  let orders = [];
  if (state.staffTab === 'preparing') orders = state.preparingOrders;
  else if (state.staffTab === 'ready') orders = state.readyOrders;
  else if (state.staffTab === 'claim') orders = state.claimOrders;
  else if (state.staffTab === 'done') orders = state.doneOrders;

  if (orders.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#999;padding:32px 0;font-weight:700;font-style:italic;">No orders here.</p>';
    return;
  }

  const showCheck = (state.staffTab === 'done' || state.staffTab === 'claim' || state.staffTab === 'ready');

  orders.forEach(order => {
    const div = document.createElement('div');
    div.className = 'staff-order-row';

    const checkIcon = showCheck
      ? `<span class="staff-check-icon">✅</span>`
      : `<span class="staff-no-icon"></span>`;

    const itemLines = order.items.map(i =>
      `<div class="staff-order-item-line"><span>${i.name}</span><span class="staff-order-item-qty">x${i.qty}</span></div>`
    ).join('');

    div.innerHTML = `
      ${checkIcon}
      <span class="staff-order-num">${order.num}</span>
      <div class="staff-order-items">${itemLines}</div>
    `;

    // Tap to move to next stage
    div.style.cursor = 'pointer';
    div.addEventListener('click', () => {
      if (state.staffTab === 'preparing') {
        state.preparingOrders = state.preparingOrders.filter(o => o.num !== order.num);
        state.readyOrders.push(order);
        centeredAlert(`🍳 Order ${order.num} is now ready for pickup!`);
      } else if (state.staffTab === 'ready') {
        state.readyOrders = state.readyOrders.filter(o => o.num !== order.num);
        state.claimOrders.push(order);
        centeredAlert(`✅ Order ${order.num} moved to To Claim section!`);
      } else if (state.staffTab === 'claim') {
        // To Claim tab is read-only - orders can only be claimed from Order Board
        return;
      }
      renderStaffOrders();
      renderOrderBoard();
    });

    container.appendChild(div);
  });
}

function renderOrderBoard() {
  const prepEl = document.getElementById('board-preparing');
  const readyEl = document.getElementById('board-ready');
  prepEl.innerHTML = '';
  readyEl.innerHTML = '';

  state.preparingOrders.forEach(o => {
    const div = document.createElement('div');
    div.className = 'board-num';
    div.textContent = o.num;
    prepEl.appendChild(div);
  });

  // Show both ready and to-claim orders in the ready column
  [...state.readyOrders, ...state.claimOrders].forEach(o => {
    const div = document.createElement('div');
    div.className = 'board-num ready';
    div.textContent = o.num;
    readyEl.appendChild(div);
  });
}

function renderAuditOrders() {
  const container = document.getElementById('audit-orders');
  container.innerHTML = '';
  state.auditOrders.forEach(entry => {
    const card = document.createElement('div');
    card.className = 'audit-card';
    card.innerHTML = `
      <div class="audit-card-date">${entry.date}</div>
      <div class="audit-card-content"><strong>${entry.num}:</strong><br>${entry.items.join('<br>')}</div>
    `;
    container.appendChild(card);
  });
}

function renderAuditPayments() {
  const container = document.getElementById('audit-payments');
  container.innerHTML = '';
  
  if (state.auditPayments.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#999;padding:32px 0;font-weight:700;font-style:italic;">No payment records found.</p>';
    return;
  }
  
  state.auditPayments.forEach(payment => {
    const card = document.createElement('div');
    card.className = 'audit-card';
    card.innerHTML = `
      <div class="audit-card-date">${payment.date}</div>
      <div class="audit-card-content">
        <strong>Order #${payment.orderNum}</strong><br>
        <strong>Payment:</strong> ${payment.paymentMethod.toUpperCase()}<br>
        <strong>Total:</strong> ₱${payment.total}<br>
        <strong>Items:</strong><br>${payment.items.join('<br>')}
      </div>
    `;
    container.appendChild(card);
  });
}

// ===================== ORDER STATUS (customer) =====================
function renderOrderStatus() {
  const prepEl = document.getElementById('status-preparing');
  const readyEl = document.getElementById('status-ready');
  if (!prepEl || !readyEl) return;
  prepEl.innerHTML = '';
  readyEl.innerHTML = '';

  state.preparingOrders.forEach(o => {
    const span = document.createElement('span');
    span.className = 'order-num-badge';
    span.textContent = o.num;
    prepEl.appendChild(span);
  });

  state.readyOrders.forEach(o => {
    const span = document.createElement('span');
    span.className = 'order-num-badge ready';
    span.textContent = o.num;
    readyEl.appendChild(span);
  });
}

document.getElementById('btn-status-claim').addEventListener('click', () => {
  if (state.orderNumber) {
    const idx = state.readyOrders.findIndex(o => o.num === state.orderNumber);
    if (idx >= 0) {
      state.doneOrders.push(state.readyOrders.splice(idx, 1)[0]);
    }
    state.orderNumber = null;
  }
  showScreen('auth');
});

// ===================== STAFF EVENT LISTENERS =====================
document.addEventListener('DOMContentLoaded', () => {
  // Staff navigation buttons
  const btnStaffAudit = document.getElementById('btn-staff-audit');
  const btnStaffBoard = document.getElementById('btn-staff-board');
  const btnStaffDone = document.getElementById('btn-staff-done');
  const btnBoardBack = document.getElementById('btn-board-back');
  const btnAuditPaymentDone = document.getElementById('btn-audit-payment-done');
  
  if (btnStaffAudit) btnStaffAudit.onclick = () => { renderAuditOrders(); showScreen('audit-orders'); };
  if (btnStaffBoard) btnStaffBoard.onclick = () => { renderOrderBoard(); showScreen('order-board'); };
  if (btnStaffDone) btnStaffDone.onclick = () => showScreen('auth');
  if (btnBoardBack) btnBoardBack.onclick = () => showScreen('staff-orders');
  if (btnAuditPaymentDone) btnAuditPaymentDone.onclick = () => showScreen('staff-orders');
  
  // Cart back button
  const btnCartBack = document.getElementById('btn-cart-back');
  if (btnCartBack) btnCartBack.onclick = () => showScreen('menu');
  
  // Checkout back button
  const btnCheckoutBack = document.getElementById('btn-checkout-back');
  if (btnCheckoutBack) btnCheckoutBack.onclick = () => showScreen('cart');
  
  // Payment back button
  const btnPaymentBack = document.getElementById('btn-payment-back');
  if (btnPaymentBack) btnPaymentBack.onclick = () => showScreen('checkout');
  
  // GCash back button
  const btnGcashBack = document.getElementById('btn-gcash-back');
  if (btnGcashBack) btnGcashBack.onclick = () => showScreen('payment');
});

// ===================== INITIALIZATION =====================
window.addEventListener('DOMContentLoaded', () => {
  showScreen('splash');
  
  // Auto transition to auth after 2 seconds
  setTimeout(() => showScreen('auth'), 2000);
  
  // Remove menu data script since we're using static HTML
  const menuDataScript = document.getElementById('menu-data');
  if (menuDataScript) menuDataScript.remove();
  
  // Initialize menu
  showCategory('rice');
});

// ===================== QR MENU =====================
// (accessible from category screen)