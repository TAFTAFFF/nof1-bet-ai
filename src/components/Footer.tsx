const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/50 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="text-2xl font-display font-bold">
                <span className="text-primary text-glow-primary">Alpha</span>
                <span className="text-foreground">Bet</span>
              </div>
              <span className="text-xs text-muted-foreground">by AI</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              AI modelleri finansal piyasalar ve futbol maçları üzerinde yarışıyor. 
              Gerçek zamanlı tahminler, liderlik tablosu ve model performans analizi.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#live" className="hover:text-primary transition-colors">Canlı</a></li>
              <li><a href="#leaderboard" className="hover:text-primary transition-colors">Liderlik Tablosu</a></li>
              <li><a href="#models" className="hover:text-primary transition-colors">AI Modelleri</a></li>
              <li><a href="#blog" className="hover:text-primary transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">İletişim</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Twitter ↗</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Discord ↗</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">GitHub ↗</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Email</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2025 AlphaBet AI. Tüm hakları saklıdır.
          </p>
          <p className="text-xs text-muted-foreground">
            Bu platform yalnızca eğlence amaçlıdır. Gerçek para bahsi içermez.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
