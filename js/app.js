/**
 * C3 Church App - Main Application JavaScript
 */

// Application State
const AppState = {
  currentPage: 'home',
  checkedIn: false,
  selectedService: '9:30 AM',
  streak: 12,
  selectedFund: 'General',
  selectedAmount: 100,
  selectedFrequency: 'One-Time',
  user: {
    name: 'Tyler Preisser',
    initials: 'TP',
    email: 'tyler@example.com'
  }
};

// Service times configuration
const ServiceTimes = [
  { id: 'sat-5', label: 'SAT 5', period: 'PM', day: 'Saturday' },
  { id: 'sun-8', label: '8:00', period: 'AM', day: 'Sunday' },
  { id: 'sun-930', label: '9:30', period: 'AM', day: 'Sunday' },
  { id: 'sun-11', label: '11:00', period: 'AM', day: 'Sunday' }
];

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initDeviceScaling();
  initNavigation();
  initCheckIn();
  initGiving();
  initServiceTimes();
  initQuickActions();
  initConnectCards();
  initPrayerForm();
  initVolunteerForm();
  initReadingCards();
  initFeaturedCards();
  initTooltips();
  updateDateDisplay();
  loadCheckInState();
});

/**
 * Device Frame Scaling
 * Calculates the scale factor to fit the phone in the viewport
 */
function initDeviceScaling() {
  const deviceFrame = document.querySelector('.device-frame');
  if (!deviceFrame) return;

  // iPhone dimensions (fixed)
  const DEVICE_WIDTH = 393;
  const DEVICE_HEIGHT = 852;
  const PADDING = 40; // 20px on each side

  function calculateScale() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Available space
    const availableWidth = viewportWidth - PADDING;
    const availableHeight = viewportHeight - PADDING;

    // Calculate scale factors
    const scaleX = availableWidth / DEVICE_WIDTH;
    const scaleY = availableHeight / DEVICE_HEIGHT;

    // Use the smaller scale to ensure phone fits completely
    const scale = Math.min(scaleX, scaleY, 1.2); // Cap at 1.2x to not get too big

    // Apply scale
    deviceFrame.style.setProperty('--device-scale', scale);
  }

  // Initial calculation
  calculateScale();

  // Recalculate on resize
  window.addEventListener('resize', calculateScale);
}

/**
 * Navigation System
 */
function initNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');

  navButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const page = btn.dataset.page;
      if (page) {
        switchPage(page);
      }
    });
  });
}

function switchPage(pageName) {
  // Update state
  AppState.currentPage = pageName;

  // Hide all pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });

  // Show target page
  const targetPage = document.getElementById(`page-${pageName}`);
  if (targetPage) {
    targetPage.classList.add('active');

    // Smooth fade-in animation
    targetPage.style.opacity = '0';
    requestAnimationFrame(() => {
      targetPage.style.transition = 'opacity 0.2s ease';
      targetPage.style.opacity = '1';
    });
  }

  // Update nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.page === pageName) {
      btn.classList.add('active');
    }
  });

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Haptic feedback (if supported)
  if (navigator.vibrate) {
    navigator.vibrate(10);
  }
}

/**
 * Check-In System
 */
function initCheckIn() {
  const checkinBtn = document.querySelector('.checkin-btn');
  if (checkinBtn) {
    checkinBtn.addEventListener('click', handleCheckIn);
  }
}

function handleCheckIn(e) {
  const btn = e.target;

  if (AppState.checkedIn) {
    // Already checked in - show toast
    showToast('You\'re already checked in!', 'info');
    return;
  }

  // Perform check-in
  AppState.checkedIn = true;
  AppState.streak++;

  // Update button
  btn.textContent = '✓ See You There!';
  btn.classList.add('checked-in');

  // Animate streak badge
  const streakBadge = document.querySelector('.streak-badge');
  if (streakBadge) {
    const countEl = streakBadge.querySelector('.streak-count');
    if (countEl) {
      countEl.textContent = AppState.streak;
    }
    streakBadge.classList.add('animate');
    setTimeout(() => streakBadge.classList.remove('animate'), 500);
  }

  // Show celebration toast
  showToast('See you on Sunday! 🎉', 'success');

  // Haptic feedback
  if (navigator.vibrate) {
    navigator.vibrate([50, 30, 50]);
  }

  // Could save to localStorage or send to server
  saveCheckInState();
}

function initServiceTimes() {
  const timeButtons = document.querySelectorAll('.time-btn');

  timeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active from all
      timeButtons.forEach(b => b.classList.remove('active'));
      // Add active to clicked
      btn.classList.add('active');

      // Update state
      const timeValue = btn.querySelector('.time-value');
      const timePeriod = btn.querySelector('.time-period');
      if (timeValue && timePeriod) {
        AppState.selectedService = `${timeValue.textContent} ${timePeriod.textContent}`;
      }

      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    });
  });
}

function saveCheckInState() {
  try {
    localStorage.setItem('c3_checkin', JSON.stringify({
      checkedIn: AppState.checkedIn,
      service: AppState.selectedService,
      streak: AppState.streak,
      date: new Date().toISOString()
    }));
  } catch (e) {
    console.warn('Could not save check-in state:', e);
  }
}

function loadCheckInState() {
  try {
    const saved = localStorage.getItem('c3_checkin');
    if (saved) {
      const data = JSON.parse(saved);
      // Check if check-in is from this week
      const savedDate = new Date(data.date);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      if (savedDate > weekAgo) {
        AppState.checkedIn = data.checkedIn;
        AppState.streak = data.streak || AppState.streak;
      }
    }
  } catch (e) {
    console.warn('Could not load check-in state:', e);
  }
}

/**
 * Giving System
 */
function initGiving() {
  // Fund selection
  const fundButtons = document.querySelectorAll('.fund-btn');
  fundButtons.forEach(btn => {
    btn.addEventListener('click', () => selectFund(btn));
  });

  // Amount selection
  const amountButtons = document.querySelectorAll('.amount-btn');
  amountButtons.forEach(btn => {
    btn.addEventListener('click', () => selectAmount(btn));
  });

  // Amount input
  const amountInput = document.getElementById('amount-input');
  if (amountInput) {
    amountInput.addEventListener('input', handleAmountInput);
    amountInput.addEventListener('focus', () => {
      // Clear preset selections when typing custom amount
      document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('active'));
    });
  }

  // Frequency selection
  const freqButtons = document.querySelectorAll('.freq-btn');
  freqButtons.forEach(btn => {
    btn.addEventListener('click', () => selectFrequency(btn));
  });

  // Submit button
  const giveSubmit = document.querySelector('.give-submit');
  if (giveSubmit) {
    giveSubmit.addEventListener('click', handleGiveSubmit);
  }
}

function selectFund(btn) {
  document.querySelectorAll('.fund-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  AppState.selectedFund = btn.textContent.trim();

  if (navigator.vibrate) {
    navigator.vibrate(10);
  }
}

function selectAmount(btn) {
  document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const amountText = btn.textContent.trim();
  const amountInput = document.getElementById('amount-input');

  if (amountText === 'Other') {
    if (amountInput) {
      amountInput.value = '';
      amountInput.focus();
    }
    AppState.selectedAmount = 0;
  } else {
    const amount = parseInt(amountText.replace('$', ''));
    AppState.selectedAmount = amount;
    if (amountInput) {
      amountInput.value = `$${amount}`;
    }
  }

  if (navigator.vibrate) {
    navigator.vibrate(10);
  }
}

function handleAmountInput(e) {
  let value = e.target.value.replace(/[^\d]/g, '');
  if (value) {
    e.target.value = '$' + parseInt(value).toLocaleString();
    AppState.selectedAmount = parseInt(value);
  } else {
    e.target.value = '';
    AppState.selectedAmount = 0;
  }
}

function selectFrequency(btn) {
  document.querySelectorAll('.freq-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  AppState.selectedFrequency = btn.textContent.trim();

  if (navigator.vibrate) {
    navigator.vibrate(10);
  }
}

function handleGiveSubmit() {
  if (AppState.selectedAmount <= 0) {
    showToast('Please enter an amount', 'error');
    return;
  }

  // In a real app, this would open a payment flow
  showToast(`Opening payment for $${AppState.selectedAmount}...`, 'success');

  // Could redirect to payment processor or open modal
  console.log('Give submission:', {
    fund: AppState.selectedFund,
    amount: AppState.selectedAmount,
    frequency: AppState.selectedFrequency
  });
}

/**
 * Quick Actions
 */
function initQuickActions() {
  const quickButtons = document.querySelectorAll('.quick-btn');

  quickButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;

      switch (action) {
        case 'give':
          switchPage('give');
          break;
        case 'prayer':
          openPrayerModal();
          break;
        case 'nt26':
          openReadingPlan();
          break;
        case 'new':
          switchPage('connect');
          break;
        default:
          console.log('Quick action:', action);
      }
    });
  });
}

function openPrayerModal() {
  openModal('prayer-modal');
}

function openReadingPlan() {
  openModal('nt26-modal');
}

function openNewHereModal() {
  openModal('new-here-modal');
}

/**
 * Toast Notifications
 */
function showToast(message, type = 'info') {
  // Remove existing toasts
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  };

  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-message">${message}</span>
  `;

  document.body.appendChild(toast);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Date Display
 */
function updateDateDisplay() {
  const dateDisplay = document.querySelector('.checkin-title');
  if (dateDisplay && dateDisplay.classList.contains('dynamic-date')) {
    const now = new Date();
    const options = { month: 'long', day: 'numeric' };
    dateDisplay.textContent = now.toLocaleDateString('en-US', options);
  }
}

/**
 * Connect Cards
 */
function initConnectCards() {
  const connectCards = document.querySelectorAll('.connect-card');

  connectCards.forEach(card => {
    card.addEventListener('click', () => {
      const title = card.querySelector('.connect-title')?.textContent;
      const action = card.dataset.action;

      // Check for data-action first
      if (action === 'prayer') {
        openPrayerModal();
        return;
      }

      switch (title) {
        case 'Prayer Request':
          openPrayerModal();
          break;
        case 'LifeGroups':
          window.location.href = 'pages/lifegroups.html';
          break;
        case 'Serve':
          openModal('volunteer-modal');
          break;
        case 'Events':
          showToast('Events calendar coming soon', 'info');
          break;
        default:
          console.log('Connect card clicked:', title);
      }

      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    });
  });
}

/**
 * Featured Cards
 */
function initFeaturedCards() {
  const featuredCards = document.querySelectorAll('.featured-card');

  featuredCards.forEach(card => {
    card.addEventListener('click', () => {
      const title = card.querySelector('.featured-title')?.textContent;

      if (title === 'New Here?') {
        openNewHereModal();
      } else if (title === 'Ready for Baptism?') {
        showToast('Baptism registration coming soon', 'info');
      }

      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    });
  });
}

/**
 * Reading Cards
 */
function initReadingCards() {
  const readingCards = document.querySelectorAll('.reading-card');

  readingCards.forEach(card => {
    card.addEventListener('click', () => {
      const title = card.querySelector('.reading-eyebrow')?.textContent;

      if (title && title.includes('NT26')) {
        openReadingPlan();
      } else if (title && title.includes('Sermon')) {
        showToast('Sermon notes coming soon', 'info');
      } else if (title && title.includes('Why Give')) {
        showToast('Generosity info coming soon', 'info');
      }

      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    });
  });
}

/**
 * Prayer Form
 */
function initPrayerForm() {
  // Prayer visibility options
  const visibilityOptions = document.querySelectorAll('.prayer-visibility-option');

  visibilityOptions.forEach(option => {
    option.addEventListener('click', () => {
      visibilityOptions.forEach(o => o.classList.remove('active'));
      option.classList.add('active');

      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    });
  });

  // Prayer form submission
  const prayerForm = document.getElementById('prayer-form');
  if (prayerForm) {
    prayerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handlePrayerSubmit();
    });
  }
}

function handlePrayerSubmit() {
  // Get form values
  const form = document.getElementById('prayer-form');
  if (!form) return;

  const name = form.querySelector('input[type="text"]')?.value;
  const email = form.querySelector('input[type="email"]')?.value;
  const request = form.querySelector('textarea')?.value;
  const visibility = document.querySelector('.prayer-visibility-option.active')?.dataset.value || 'team';

  if (!name || !request) {
    showToast('Please fill in required fields', 'error');
    return;
  }

  // Log the submission (in real app, would send to server)
  console.log('Prayer request:', { name, email, request, visibility });

  // Close modal and show success
  closeModal('prayer-modal');
  showToast('Prayer request submitted. We\'re praying for you!', 'success');

  // Reset form
  form.reset();
  document.querySelectorAll('.prayer-visibility-option').forEach((o, i) => {
    o.classList.toggle('active', i === 0);
  });
}

/**
 * Volunteer Form
 */
function initVolunteerForm() {
  // Team selection cards
  const teamCards = document.querySelectorAll('.volunteer-team-card');

  teamCards.forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('selected');

      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    });
  });

  // Submit button
  const submitBtn = document.querySelector('.volunteer-submit');
  if (submitBtn) {
    submitBtn.addEventListener('click', handleVolunteerSubmit);
  }
}

function handleVolunteerSubmit() {
  const selectedTeams = document.querySelectorAll('.volunteer-team-card.selected');

  if (selectedTeams.length === 0) {
    showToast('Please select at least one team', 'error');
    return;
  }

  const teams = Array.from(selectedTeams).map(card => card.dataset.team);

  // Log the submission (in real app, would send to server)
  console.log('Volunteer signup:', { teams });

  // Close modal and show success
  closeModal('volunteer-modal');
  showToast(`Signed up for ${selectedTeams.length} team${selectedTeams.length > 1 ? 's' : ''}! We'll be in touch.`, 'success');

  // Reset selections
  document.querySelectorAll('.volunteer-team-card').forEach(card => {
    card.classList.remove('selected');
  });
}

/**
 * Tooltips (placeholder for future enhancement)
 */
function initTooltips() {
  // Could add tooltip functionality here
}

/**
 * Modal System
 */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
    document.body.style.overflow = '';
  }
});

// Close modal on escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const activeModal = document.querySelector('.modal-overlay.active');
    if (activeModal) {
      activeModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
});

/**
 * Pull to Refresh (iOS-like)
 */
let touchStartY = 0;
let pullDistance = 0;

document.addEventListener('touchstart', (e) => {
  if (window.scrollY === 0) {
    touchStartY = e.touches[0].clientY;
  }
}, { passive: true });

document.addEventListener('touchmove', (e) => {
  if (touchStartY > 0) {
    pullDistance = e.touches[0].clientY - touchStartY;
    if (pullDistance > 0 && pullDistance < 150) {
      // Could show pull-to-refresh indicator
    }
  }
}, { passive: true });

document.addEventListener('touchend', () => {
  if (pullDistance > 80) {
    // Trigger refresh
    showToast('Refreshing...', 'info');
    setTimeout(() => {
      // Could reload data here
      showToast('Content updated', 'success');
    }, 1000);
  }
  touchStartY = 0;
  pullDistance = 0;
});

/**
 * Service Worker Registration (for PWA capabilities)
 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered:', registration.scope);
      })
      .catch(error => {
        console.log('SW registration failed:', error);
      });
  });
}

/**
 * Expose functions globally for onclick handlers
 */
window.switchPage = switchPage;
window.selectFund = selectFund;
window.selectAmount = selectAmount;
window.selectFrequency = selectFrequency;
window.openModal = openModal;
window.closeModal = closeModal;
window.openPrayerModal = openPrayerModal;
window.openReadingPlan = openReadingPlan;
window.openNewHereModal = openNewHereModal;
window.showToast = showToast;
