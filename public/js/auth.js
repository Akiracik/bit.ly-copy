document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const alertContainer = document.getElementById('alert-container');
  const passwordInputs = document.querySelectorAll('input[type="password"]');
  const passwordToggles = document.querySelectorAll('.password-toggle');
  const passwordStrength = document.getElementById('password-strength');
  
  // Şifre göster/gizle düğmeleri
  if (passwordToggles.length > 0) {
    passwordToggles.forEach(toggle => {
      toggle.addEventListener('click', function() {
        const input = this.parentElement.querySelector('input');
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        this.querySelector('i').classList.toggle('fa-eye');
        this.querySelector('i').classList.toggle('fa-eye-slash');
      });
    });
  }
  
  // Şifre gücü göstergesi
  if (passwordStrength && registerForm) {
    const passwordInput = document.getElementById('password');
    
    passwordInput.addEventListener('input', function() {
      updatePasswordStrength(this.value);
    });
    
    function updatePasswordStrength(password) {
      // Basit şifre gücü kontrolü
      let strength = 0;
      
      if (password.length >= 8) strength += 1;
      if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 1;
      if (password.match(/[0-9]/)) strength += 1;
      if (password.match(/[^a-zA-Z0-9]/)) strength += 1;
      
      // Şifre gücü göstergesini güncelle
      if (strength < 2) {
        passwordStrength.setAttribute('data-strength', 'weak');
        passwordStrength.innerHTML = '<div class="password-strength-text weak">Zayıf</div>';
      } else if (strength === 2) {
        passwordStrength.setAttribute('data-strength', 'medium');
        passwordStrength.innerHTML = '<div class="password-strength-text medium">Orta</div>';
      } else {
        passwordStrength.setAttribute('data-strength', 'strong');
        passwordStrength.innerHTML = '<div class="password-strength-text strong">Güçlü</div>';
      }
    }
  }
  
  // Uyarı mesajı oluşturma
  function showAlert(message, type = 'danger') {
    alertContainer.innerHTML = `
      <div class="alert alert-${type}">
        <i class="fas fa-${type === 'danger' ? 'exclamation-circle' : 'check-circle'}"></i>
        ${message}
      </div>
    `;
    
    // Otomatik kapat
    setTimeout(() => {
      const alert = alertContainer.querySelector('.alert');
      if (alert) {
        alert.style.opacity = '0';
        setTimeout(() => {
          alertContainer.innerHTML = '';
        }, 300);
      }
    }, 5000);
  }
  
  // Giriş formu işlemi
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const submitButton = this.querySelector('button[type="submit"]');
      
      // Butonu devre dışı bırak ve yükleniyor göster
      submitButton.disabled = true;
      submitButton.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Giriş Yapılıyor...';
      
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
          // Başarılı giriş
          showAlert('Giriş başarılı! Yönlendiriliyorsunuz...', 'success');
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1000);
        } else {
          // Giriş hatası
          showAlert(data.error || 'Giriş yapılırken bir hata oluştu');
          // Butonu tekrar etkinleştir
          submitButton.disabled = false;
          submitButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Giriş Yap';
        }
      } catch (error) {
        console.error('Login error:', error);
        showAlert('Sunucuya bağlanırken bir hata oluştu, lütfen tekrar deneyin');
        // Butonu tekrar etkinleştir
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Giriş Yap';
      }
    });
  }
  
  // Kayıt formu işlemi
  if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const username = document.getElementById('username').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const password2 = document.getElementById('password2').value;
      const terms = document.getElementById('terms').checked;
      const submitButton = this.querySelector('button[type="submit"]');
      
      // Şifre kontrolü
      if (password !== password2) {
        showAlert('Şifreler eşleşmiyor');
        return;
      }
      
      // Şartlar kontrolü
      if (!terms) {
        showAlert('Kullanım şartlarını ve gizlilik politikasını kabul etmelisiniz');
        return;
      }
      
      // Butonu devre dışı bırak ve yükleniyor göster
      submitButton.disabled = true;
      submitButton.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Kayıt Yapılıyor...';
      
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
          // Başarılı kayıt
          showAlert('Kayıt başarılı! Yönlendiriliyorsunuz...', 'success');
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1000);
        } else {
          // Kayıt hatası
          showAlert(data.error || 'Kayıt olurken bir hata oluştu');
          // Butonu tekrar etkinleştir
          submitButton.disabled = false;
          submitButton.innerHTML = '<i class="fas fa-user-plus"></i> Kayıt Ol';
        }
      } catch (error) {
        console.error('Register error:', error);
        showAlert('Sunucuya bağlanırken bir hata oluştu, lütfen tekrar deneyin');
        // Butonu tekrar etkinleştir
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-user-plus"></i> Kayıt Ol';
      }
    });
  }
});