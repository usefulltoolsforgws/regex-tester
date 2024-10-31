// Constants and DOM element selections
const ELEMENTS = {
  regexPattern: document.querySelector('.regex-pattern'),
  regexFlags: document.querySelectorAll('input[name="flag"]'),
  testText: document.getElementById('test-text'),
  testTextOverlay: document.getElementById('test-text-overlay'),
  resultDiv: document.getElementById('result-div'),
  matchCount: document.querySelector('.match-count'),
  errorMessage: document.querySelector('.error-message'),
  copyRegexBtn: document.querySelector('.copy-regex'),
  clearAllBtn: document.querySelector('.clear-all'),
  tabButtons: document.querySelectorAll('.tab-button'),
  tabContents: document.querySelectorAll('.tab-content'),
};

// Core functionality
function updateResult() {
  const pattern = ELEMENTS.regexPattern.value.trim();
  const flags = Array.from(ELEMENTS.regexFlags)
    .filter(checkbox => checkbox.checked)
    .map(checkbox => checkbox.value)
    .join('');
  const text = ELEMENTS.testText.value;

  if (!pattern || !text) {
    ELEMENTS.resultDiv.textContent = 'No matches found';
    ELEMENTS.matchCount.textContent = 'Matches: 0';
    ELEMENTS.testTextOverlay.innerHTML = text;
    return;
  }

  try {
    const regex = new RegExp(pattern, flags);
    const matches = text.match(regex);

    if (matches) {
      // Highlight all matches in the text field
      let highlightedText = text;
      let lastIndex = 0;
      const fragments = [];

      if (flags.includes('g')) {
        matches.forEach(match => {
          const matchIndex = text.indexOf(match, lastIndex);
          fragments.push(
            text.slice(lastIndex, matchIndex),
            `<mark>${match}</mark>`
          );
          lastIndex = matchIndex + match.length;
        });
        fragments.push(text.slice(lastIndex));
      } else {
        const matchIndex = text.indexOf(matches[0]);
        fragments.push(
          text.slice(0, matchIndex),
          `<mark>${matches[0]}</mark>`,
          text.slice(matchIndex + matches[0].length)
        );
      }

      highlightedText = fragments.join('');

      // Show highlighted text in the overlay
      ELEMENTS.testTextOverlay.innerHTML = highlightedText;

      // Show only matches in the result field
      ELEMENTS.resultDiv.innerHTML = matches.map(match => `<span class="match">${match}</span>`).join(', ');

      // Display match count
      ELEMENTS.matchCount.textContent = `Matches: ${flags.includes('g') ? matches.length : 1}`;
      ELEMENTS.errorMessage.classList.add('hidden');
    } else {
      ELEMENTS.resultDiv.textContent = 'No matches found';
      ELEMENTS.matchCount.textContent = 'Matches: 0';
      ELEMENTS.testTextOverlay.innerHTML = text;
    }
  } catch (error) {
    showError(error.message);
    ELEMENTS.testTextOverlay.innerHTML = text;
  }
}

function showError(message) {
  ELEMENTS.errorMessage.textContent = `Error: ${message}`;
  ELEMENTS.errorMessage.classList.remove('hidden');
  ELEMENTS.resultDiv.textContent = '';
  ELEMENTS.matchCount.textContent = '';
}

// Event handlers
function handleRegexInput() {
  updateResult();
}

function handleTestTextInput() {
  ELEMENTS.testTextOverlay.scrollTop = ELEMENTS.testText.scrollTop;
  updateResult();
}

// Accordion functionality
function initializeAccordion() {
  const accordionHeadings = document.querySelectorAll('.accordion-heading');
  accordionHeadings.forEach(heading => {
    heading.addEventListener('click', () => {
      const content = heading.nextElementSibling;
      content.style.display = content.style.display === 'block' ? 'none' : 'block';
      heading.classList.toggle('active');
    });
  });
}

// Tab switching functionality
function initializeTabs() {
  ELEMENTS.tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.getAttribute('aria-controls');
      
      // Deactivate all tabs
      ELEMENTS.tabButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      });
      ELEMENTS.tabContents.forEach(content => {
        content.classList.add('hidden');
      });

      // Activate the clicked tab
      button.classList.add('active');
      button.setAttribute('aria-selected', 'true');
      document.getElementById(tabId).classList.remove('hidden');
    });
  });
}

// Tooltip functionality
function initializeTooltips() {
  const infoButtons = document.querySelectorAll('.info-btn');
  let activeTooltip = null;

  infoButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (activeTooltip) {
        activeTooltip.remove();
        if (activeTooltip.button === button) {
          activeTooltip = null;
          return;
        }
      }

      const tooltipText = button.getAttribute('data-tooltip');
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.textContent = tooltipText;
      document.body.appendChild(tooltip);

      const buttonRect = button.getBoundingClientRect();
      tooltip.style.left = `${buttonRect.left + buttonRect.width / 2 - tooltip.offsetWidth / 2}px`;
      tooltip.style.top = `${buttonRect.bottom + 5}px`;

      activeTooltip = tooltip;
      activeTooltip.button = button;
    });
  });

  document.addEventListener('click', () => {
    if (activeTooltip) {
      activeTooltip.remove();
      activeTooltip = null;
    }
  });
}

// Rating functionality
function initializeRating() {
  const starsContainer = document.querySelector('.stars');
  const stars = document.querySelectorAll('.star');
  let selectedRating = 0;

  starsContainer.addEventListener('mouseleave', () => {
    if (selectedRating === 0) {
      highlightStars(0);
    } else {
      highlightStars(selectedRating);
    }
  });

  stars.forEach(star => {
    star.addEventListener('mouseenter', () => {
      const rating = parseInt(star.getAttribute('data-value'));
      highlightStars(rating);
    });

    star.addEventListener('click', () => {
      selectedRating = parseInt(star.getAttribute('data-value'));
      highlightStars(selectedRating);
      
      let url = selectedRating >= 4 ? 'https://chromewebstore.google.com/detail/regex-tester/iddhiaenahbdhgfoggmjkndicdfkbnbl' : 'https://forms.gle/87qrnZPSkRpUZR1Q7';
      
      if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ action: "openTab", url: url });
      } else {
        console.error('Chrome runtime API not available');
        // Fallback: open the URL in the current tab
        window.open(url, '_blank');
      }
    });
  });
}

function highlightStars(rating) {
  const stars = document.querySelectorAll('.star');
  stars.forEach((star, index) => {
    if (index < rating) {
      star.classList.add('hover');
    } else {
      star.classList.remove('hover');
    }
  });
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  // Event listeners
  ELEMENTS.regexPattern.addEventListener('input', handleRegexInput);
  ELEMENTS.regexFlags.forEach(checkbox => {
    checkbox.addEventListener('change', handleRegexInput);
  });
  ELEMENTS.testText.addEventListener('input', handleTestTextInput);
  ELEMENTS.testText.addEventListener('scroll', () => {
    ELEMENTS.testTextOverlay.scrollTop = ELEMENTS.testText.scrollTop;
  });
  ELEMENTS.copyRegexBtn.addEventListener('click', () => copyToClipboard(ELEMENTS.regexPattern.value));
  ELEMENTS.clearAllBtn.addEventListener('click', clearAll);

  // Initialize tabs
  initializeTabs();

  // Initialize accordion
  initializeAccordion();

  // Initialize tooltips
  initializeTooltips();

  // Initial update
  updateResult();

  // Add event listeners for playbook copy buttons
  const playbookCopyButtons = document.querySelectorAll('.copy-playbook-regex');
  playbookCopyButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const regex = e.target.closest('tr').querySelector('code').textContent;
      copyToClipboard(regex);
    });
  });

  // Initialize rating
  initializeRating();
});

// Utility functions
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast("Copied to clipboard");
  });
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 2000);
}

function clearAll() {
  ELEMENTS.regexPattern.value = '';
  ELEMENTS.regexFlags.forEach(checkbox => checkbox.checked = false);
  ELEMENTS.testText.value = '';
  ELEMENTS.testTextOverlay.innerHTML = '';
  ELEMENTS.resultDiv.textContent = '';
  ELEMENTS.matchCount.textContent = '';
  ELEMENTS.errorMessage.classList.add('hidden');
}
