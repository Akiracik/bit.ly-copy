document.addEventListener('DOMContentLoaded', function() {
    const createLinkBtn = document.getElementById('create-link-btn');
    const createLinkForm = document.getElementById('create-link-form');
    const dashboardShortenForm = document.getElementById('dashboard-shorten-form');
    const linksContainer = document.getElementById('links-container');
    const paginationContainer = document.getElementById('pagination');
    
    let currentPage = 1;
    const limit = 10;
    
    // Link oluşturma formunu göster/gizle
    if (createLinkBtn && createLinkForm) {
      createLinkBtn.addEventListener('click', function() {
        createLinkForm.style.display = createLinkForm.style.display === 'none' ? 'block' : 'none';
      });
    }
    
    // Kullanıcının linklerini getir
    async function fetchLinks(page = 1) {
      try {
        linksContainer.innerHTML = '<div class="loading">Linkler yükleniyor...</div>';
        
        const response = await fetch(`/api/links?page=${page}&limit=${limit}`);
        const data = await response.json();
        
        if (data.success) {
          renderLinks(data.data);
          renderPagination(data.pagination);
        } else {
          linksContainer.innerHTML = `<div class="alert alert-danger">${data.error || 'Linkler yüklenirken bir hata oluştu'}</div>`;
        }
      } catch (error) {
        console.error('Fetch links error:', error);
        linksContainer.innerHTML = '<div class="alert alert-danger">Sunucuya bağlanırken bir hata oluştu, lütfen tekrar deneyin</div>';
      }
    }
    
    // Linkleri listele
    function renderLinks(links) {
      if (links.length === 0) {
        linksContainer.innerHTML = '<div class="alert alert-info">Henüz hiç link oluşturmadınız</div>';
        return;
      }
      
      let html = `
        <table class="links-table">
          <thead>
            <tr>
              <th>Orijinal URL</th>
              <th>Kısa URL</th>
              <th>Tıklanma</th>
              <th>Durum</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      links.forEach(link => {
        const statusText = link.active ? 'Aktif' : 'Pasif';
        const statusClass = link.active ? 'success' : 'danger';
        const toggleText = link.active ? 'Devre Dışı Bırak' : 'Aktifleştir';
        
        html += `
          <tr>
            <td title="${link.originalUrl}">
              ${truncateText(link.originalUrl, 40)}
            </td>
            <td>
              <a href="${link.shortUrl}" target="_blank">${link.shortUrl}</a>
              <button class="copy-btn action-btn" data-url="${link.shortUrl}">Kopyala</button>
            </td>
            <td>${link.clicks}</td>
            <td>
              <span class="status-${statusClass}">${statusText}</span>
            </td>
            <td>
              <a href="/stats/${link.id}" class="action-btn">İstatistikler</a>
              <button class="toggle-btn action-btn" data-id="${link.id}" data-active="${link.active}">${toggleText}</button>
              <button class="delete-btn action-btn" data-id="${link.id}">Sil</button>
            </td>
          </tr>
        `;
      });
      
      html += '</tbody></table>';
      linksContainer.innerHTML = html;
      
      // Kopyalama butonları
      document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const url = this.getAttribute('data-url');
          copyToClipboard(url, this);
        });
      });
      
      // Durum değiştirme butonları
      document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const id = this.getAttribute('data-id');
          toggleLinkStatus(id);
        });
      });
      
      // Silme butonları
      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const id = this.getAttribute('data-id');
          deleteLink(id);
        });
      });
    }
    
    // Sayfalama
    function renderPagination(pagination) {
      if (!pagination || pagination.pages <= 1) {
        paginationContainer.innerHTML = '';
        return;
      }
      
      let html = '<ul>';
      
      // Önceki sayfa
      if (pagination.page > 1) {
        html += `<li class="pagination-item"><a href="#" class="pagination-link" data-page="${pagination.page - 1}">Önceki</a></li>`;
      }
      
      // Sayfa numaraları
      for (let i = 1; i <= pagination.pages; i++) {
        const activeClass = i === pagination.page ? 'active' : '';
        html += `<li class="pagination-item"><a href="#" class="pagination-link ${activeClass}" data-page="${i}">${i}</a></li>`;
      }
      
      // Sonraki sayfa
      if (pagination.page < pagination.pages) {
        html += `<li class="pagination-item"><a href="#" class="pagination-link" data-page="${pagination.page + 1}">Sonraki</a></li>`;
      }
      
      html += '</ul>';
      paginationContainer.innerHTML = html;
      
      // Sayfa değiştirme tıklamaları
      document.querySelectorAll('.pagination-link').forEach(link => {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          const page = parseInt(this.getAttribute('data-page'));
          currentPage = page;
          fetchLinks(page);
        });
      });
    }
    
    // Metni kısaltma
    function truncateText(text, maxLength) {
      if (text.length <= maxLength) return text;
      return text.substr(0, maxLength) + '...';
    }
    
    // Panoya kopyalama
    function copyToClipboard(text, button) {
      navigator.clipboard.writeText(text).then(function() {
        const originalText = button.textContent;
        button.textContent = 'Kopyalandı!';
        setTimeout(() => {
          button.textContent = originalText;
        }, 2000);
      }).catch(function(err) {
        console.error('Kopyalama hatası:', err);
      });
    }
    
    // Link durumunu değiştirme
    async function toggleLinkStatus(id) {
      try {
        const response = await fetch(`/api/links/${id}/toggle`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          // Mevcut sayfayı yeniden yükle
          fetchLinks(currentPage);
        } else {
          alert(data.error || 'Durum değiştirilirken bir hata oluştu');
        }
      } catch (error) {
        console.error('Toggle status error:', error);
        alert('Sunucuya bağlanırken bir hata oluştu, lütfen tekrar deneyin');
      }
    }
    
    // Link silme
    async function deleteLink(id) {
      if (!confirm('Bu linki silmek istediğinizden emin misiniz?')) {
        return;
      }
      
      try {
        const response = await fetch(`/api/links/${id}`, {
          method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
          // Mevcut sayfayı yeniden yükle
          fetchLinks(currentPage);
        } else {
          alert(data.error || 'Link silinirken bir hata oluştu');
        }
      } catch (error) {
        console.error('Delete link error:', error);
        alert('Sunucuya bağlanırken bir hata oluştu, lütfen tekrar deneyin');
      }
    }
    
    // Link oluşturma
    if (dashboardShortenForm) {
      dashboardShortenForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const urlInput = document.getElementById('dashboard-url-input');
        const customCodeInput = document.getElementById('custom-code-input');
        const formMessage = document.querySelector('.form-message');
        
        const url = urlInput.value.trim();
        const customCode = customCodeInput.value.trim();
        
        formMessage.textContent = 'Kısaltılıyor...';
        
        try {
          const response = await fetch('/api/links/user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              url,
              customCode: customCode || undefined
            })
          });
          
          const data = await response.json();
          
          if (data.success) {
            // Başarılı
            formMessage.textContent = 'Link başarıyla oluşturuldu!';
            formMessage.style.color = 'green';
            urlInput.value = '';
            customCodeInput.value = '';
            
            // Formu kapat ve linkleri güncelle
            setTimeout(() => {
              formMessage.textContent = '';
              createLinkForm.style.display = 'none';
              fetchLinks(1); // İlk sayfaya dön
            }, 2000);
          } else {
            // Hata
            formMessage.textContent = data.error || 'Bir hata oluştu, lütfen tekrar deneyin';
            formMessage.style.color = 'red';
          }
        } catch (error) {
          console.error('Create link error:', error);
          formMessage.textContent = 'Sunucuya bağlanırken bir hata oluştu, lütfen tekrar deneyin';
          formMessage.style.color = 'red';
        }
      });
    }
    
    // Linkleri başlangıçta yükle
    fetchLinks();
  });