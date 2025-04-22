document.addEventListener('DOMContentLoaded', function() {
    // URL kısaltma formu
    const shortenForm = document.getElementById('shorten-form');
    const urlInput = document.getElementById('url-input');
    const formMessage = document.querySelector('.form-message');
    const resultContainer = document.getElementById('result-container');
    const shortUrlInput = document.getElementById('short-url');
    const copyBtn = document.getElementById('copy-btn');
    
    // reCAPTCHA
    let recaptchaToken = '';
    
    // reCAPTCHA token'ı al
    const loadRecaptcha = async () => {
      try {
        const siteKey = document.querySelector('script[src*="recaptcha"]').src.split('render=')[1];
        
        if (siteKey) {
          recaptchaToken = await grecaptcha.execute(siteKey, {action: 'submit'});
        }
      } catch (error) {
        console.error('reCAPTCHA error:', error);
      }
    };
    
    loadRecaptcha();
    
    // Çıkış butonu
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        
        try {
          const response = await fetch('/api/auth/logout');
          const data = await response.json();
          
          if (data.success) {
            window.location.href = '/';
          }
        } catch (error) {
          console.error('Logout error:', error);
        }
      });
    }
    
    // URL kısaltma
    if (shortenForm) {
      shortenForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const url = urlInput.value.trim();
        
        // URL formatı kontrolü
        if (!isValidUrl(url)) {
          formMessage.textContent = 'Lütfen geçerli bir URL girin (http:// veya https:// ile başlamalıdır)';
          return;
        }
        
        formMessage.textContent = 'Kısaltılıyor...';
        
        try {
          // reCAPTCHA token'ı yenile
          await loadRecaptcha();
          
          const response = await fetch('/api/links', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              url,
              recaptchaToken
            })
          });
          
          const data = await response.json();
          
          if (data.success) {
            // Başarılı
            formMessage.textContent = '';
            resultContainer.style.display = 'block';
            shortUrlInput.value = data.data.shortUrl;
            urlInput.value = '';
            window.scrollTo({
              top: resultContainer.offsetTop - 50,
              behavior: 'smooth'
            });
          } else {
            // Hata
            formMessage.textContent = data.error || 'Bir hata oluştu, lütfen tekrar deneyin';
          }
        } catch (error) {
          console.error('Error:', error);
          formMessage.textContent = 'Sunucuya bağlanırken bir hata oluştu, lütfen tekrar deneyin';
        }
      });
    }
    
    // URL kopyalama
    if (copyBtn) {
      copyBtn.addEventListener('click', function() {
        shortUrlInput.select();
        document.execCommand('copy');
        
        // Kopyalama geri bildirimi
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Kopyalandı!';
        
        setTimeout(() => {
          copyBtn.textContent = originalText;
        }, 2000);
      });
    }
    
    // URL formatı kontrolü
    function isValidUrl(url) {
      try {
        const parsedUrl = new URL(url);
        return ['http:', 'https:'].includes(parsedUrl.protocol);
      } catch (error) {
        return false;
      }
    }
  });