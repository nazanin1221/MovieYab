
// Elements
const loginModal = document.getElementById('loginModal');
const modalContent = document.querySelector('.modalContent');
const loginBtnNav = document.querySelector('nav button:nth-child(1)');
const loginBtnHero = document.querySelector('section button:nth-child(2)');
const closeModal = document.getElementById('closeModal');
const loginSubmit = document.getElementById('loginSubmit');
const errorMsg = document.getElementById('loginError');
const togglePassword = document.getElementById('togglePassword');

// Functions
function openLoginModal() {
  loginModal.classList.remove('hidden');
  setTimeout(() => modalContent.classList.add('show'), 10);
}

function closeLoginModal() {
  modalContent.classList.remove('show');
  modalContent.classList.add('hide');
  setTimeout(() => {
    loginModal.classList.add('hidden');
    modalContent.classList.remove('hide');
  }, 200);
}

// Events to open modal
loginBtnNav.addEventListener('click', openLoginModal);
loginBtnHero.addEventListener('click', openLoginModal);
closeModal.addEventListener('click', closeLoginModal);

// Password toggle
togglePassword.addEventListener('click', () => {
  const passwordInput = document.getElementById('passwordInput');
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    togglePassword.classList.replace('bx-hide', 'bx-show');
  } else {
    passwordInput.type = 'password';
    togglePassword.classList.replace('bx-show', 'bx-hide');
  }
});

// Login validation
loginSubmit.addEventListener('click', () => {
  const email = document.getElementById('emailInput').value.trim();
  const password = document.getElementById('passwordInput').value.trim();

  const isValidEmail = /\S+@\S+\.\S+/.test(email);

  if (!isValidEmail || password.length < 4) {
    errorMsg.classList.remove('hidden');
    
    // Add shake animation to inputs
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');
    
    emailInput.style.animation ='none';
    passwordInput.style.animation ='none';
    
    setTimeout(() => {
      emailInput.style.animation ='shake 0.5s ease-in-out';
      passwordInput.style.animation = 'shake 0.5s ease-in-out';
    }, 10);
    
    return;
  }

  errorMsg.classList.add('hidden');
  localStorage.setItem('isLogged','true');
  window.location.href = 'search.html';
});
