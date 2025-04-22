// Giriş sayfası
exports.loginPage = (req, res) => {
    if (req.user) {
      return res.redirect('/dashboard');
    }
    res.render('login', { 
      title: 'Giriş Yap',
      error: null
    });
  };
  
  // Kayıt sayfası
  exports.registerPage = (req, res) => {
    if (req.user) {
      return res.redirect('/dashboard');
    }
    res.render('register', { 
      title: 'Kayıt Ol',
      error: null
    });
  };
  
  // Ana sayfa
  exports.homePage = (req, res) => {
    res.render('index', {
      title: 'Akira URL Kısaltma',
      user: req.user || null
    });
  };
  
  // Dashboard sayfası
  exports.dashboardPage = (req, res) => {
    res.render('dashboard', {
      title: 'Dashboard',
      user: req.user
    });
  };
  
  // İstatistik sayfası
  exports.statsPage = (req, res) => {
    res.render('stats', {
      title: 'Link İstatistikleri',
      user: req.user,
      linkId: req.params.id
    });
  };
  
  // 404 sayfası
  exports.notFoundPage = (req, res) => {
    res.status(404).render('errors/404', { 
      title: 'Sayfa Bulunamadı' 
    });
  };
  
  // 500 sayfası
  exports.errorPage = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('errors/500', { 
      title: 'Sunucu Hatası' 
    });
  };