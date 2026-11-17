import React, { useEffect, useState } from 'react';
import { Search, MapPin, Bell, Tag, Flame, Percent, Gift, ShoppingBag, X, Star, Info, ChevronLeft, Eye, Share2, Store, Download, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { offersService } from './api/client';
import './index.css';
import { AboutPage, CareersPage, ContactPage, PrivacyPolicyPage, TermsPage, CookiePolicyPage } from './StaticPages';

interface Category {
  id: string;
  name: string;
  icon?: string;
  children?: Category[];
}

interface Business {
  id: string;
  business_name: string;
  logo_url?: string;
  rating?: number;
}

interface AffiliateStore {
  id: string;
  name: string;
  logo_url?: string;
  brand_color?: string;
  affiliate_url?: string;
}

interface Offer {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  banner_url?: string;
  start_date?: string;
  end_date?: string;
  business: {
    id: string;
    name: string;
    logo_url?: string;
    address?: string;
    rating?: number;
  };
  offer_rules: any[];
  terms_conditions?: string;
  _count?: {
    offer_views: number;
    offer_clicks: number;
    offer_leads: number;
    user_saved_offers: number;
    offer_shares?: number;
  };
}

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.ofera.user';

const STATIC_FILTERS = [
  { id: 'hot', name: 'Hot Deals', icon: Flame },
  { id: 'discount', name: 'Discounts', icon: Percent },
  { id: 'buy-one-get-one', name: 'BOGO', icon: Gift },
  { id: 'cashback', name: 'Cashback', icon: ShoppingBag },
];

const NOTIFICATIONS = [
  {
    id: 1,
    title: 'Welcome to Spot Loot! 👋',
    message: 'Discover the best offers and deals from shops near you. Start exploring now!',
    time: 'Just now',
    icon: <Sparkles size={20} color="var(--primary)" />
  },
  {
    id: 2,
    title: 'Get Personalized Deals 🎯',
    message: 'Add your favorite categories to see more offers you love.',
    time: '2 mins ago',
    icon: <Tag size={20} color="#008489" />
  }
];

// Helper function to format expiry date
const formatExpiryDate = (endDate?: string) => {
  if (!endDate) return null;

  const now = new Date();
  const expiry = new Date(endDate);
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Expired';
  if (diffDays === 0) return 'Ends today';
  if (diffDays === 1) return 'Ends tomorrow';
  if (diffDays <= 7) return `Ends in ${diffDays} days`;

  return `Ends ${expiry.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`;
};

function DownloadModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="download-modal-overlay" onClick={onClose}>
      <div className="download-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>
        <div className="download-modal-icon">
          <Download size={40} />
        </div>
        <h2 className="download-modal-title">Download Spot Loot App</h2>
        <p className="download-modal-text">
          To claim this offer and explore thousands more, please download our mobile application from the Google Play Store.
        </p>
        <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="play-store-button">
          <ShoppingBag size={20} />
          Get it on Google Play
        </a>
      </div>
    </div>
  );
}

function OfferDetailModal({ offer, onClose, onAction }: { offer: Offer; onClose: () => void; onAction: () => void }) {
  if (!offer) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="modal-body">
          <img
            src={offer.image_url || offer.banner_url || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80'}
            className="modal-image"
            alt={offer.title}

          />



          <div className="modal-header">
            <h2 className="modal-title">{offer.title}</h2>
            <div className="modal-business-info">
              <img
                src={offer.business?.logo_url || 'https://via.placeholder.com/48'}
                className="modal-business-logo"
                alt={offer.business?.name}
              />
              <div>
                <div style={{ fontWeight: 600 }}>{offer.business?.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Star size={14} fill="#FFB800" color="#FFB800" /> {offer.business?.rating || 4.5} • {offer.business?.address || 'Near you'}
                </div>
              </div>
            </div>

            {offer.end_date && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', color: '#e53935', fontWeight: 600, fontSize: '14px' }}>
                <Clock size={16} />
                {formatExpiryDate(offer.end_date)}
              </div>
            )}

            <div className="metrics-row" style={{ marginTop: '12px' }}>
              <div className="metric-item">
                <Eye size={16} />
                <span>{offer._count?.offer_views || 0} views</span>
              </div>
              <div className="metric-item">
                <Share2 size={16} />
                <span>{offer._count?.offer_shares || 0} shares</span>
              </div>
            </div>
          </div>

          <div className="modal-section">
            <h3 className="modal-section-title">About this offer</h3>
            <p style={{ color: 'var(--text-muted)', whiteSpace: 'pre-line' }}>{offer.description}</p>
          </div>

          <div className="modal-section">
            <h3 className="modal-section-title">Rules & Benefits</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {offer.offer_rules?.map((rule, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ padding: '8px', background: 'var(--surface)', borderRadius: '8px' }}>
                    <Info size={20} color="var(--primary)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{rule.rule_type?.replace(/_/g, ' ')}</div>
                    <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                      Save big with this {rule.rule_type?.replace(/_/g, ' ').toUpperCase()} deal.
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 900, color: 'green' }}>
                      Discount: ₹{rule.discount_value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="action-button" onClick={onAction}>Claim Offer Now</button>
        </div>
      </div>
    </div>
  );
}

function NotificationsSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <div className={`notifications-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className={`notifications-slider ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="notifications-header">
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Notifications</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="notifications-list">
          {NOTIFICATIONS.map((notif) => (
            <div key={notif.id} className="notification-card">
              <div className="notification-icon-box">
                {notif.icon}
              </div>
              <div className="notification-content">
                <h4 className="notification-title">{notif.title}</h4>
                <p className="notification-msg">{notif.message}</p>
                <span className="notification-time">{notif.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [affiliateStores, setAffiliateStores] = useState<AffiliateStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Filtering states
  const [activeFilterId, setActiveFilterId] = useState('all');
  const [selectedParentCategory, setSelectedParentCategory] = useState<Category | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const hoverTimeoutRef = React.useRef<any>(null);
  const [activePage, setActivePage] = useState('home');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activePage]);

  // Location states
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; city?: string } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchBusinesses();
    fetchAffiliateStores();

    // Auto-show popup after 10 seconds
    const timer = setTimeout(() => {
      setShowDownloadModal(true);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchOffers();
  }, [activeFilterId, selectedCategoryId, userLocation]);

  const fetchCategories = async () => {
    try {
      const data = await offersService.getCategories();
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBusinesses = async () => {
    try {
      const data = await offersService.getBusinesses();
      setBusinesses(data || []);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    }
  };

  const fetchAffiliateStores = async () => {
    try {
      const data = await offersService.getAffiliateStores();
      setAffiliateStores(data || []);
    } catch (error) {
      console.error('Error fetching affiliate stores:', error);
    }
  };

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const locationParams = userLocation ? {
        latitude: userLocation.lat,
        longitude: userLocation.lng
      } : {};

      const response = activeFilterId === 'hot'
        ? await offersService.getHotDeals(locationParams)
        : await offersService.getFeed({
          search: search || undefined,
          offerType: ['discount', 'buy-one-get-one', 'cashback'].includes(activeFilterId) ? activeFilterId : undefined,
          categoryId: selectedCategoryId || undefined,
          ...locationParams
        });

      const rawOffers = Array.isArray(response) ? response : response?.data || [];

      const mappedOffers = rawOffers.map((o: any) => ({
        ...o,
        business: {
          id: o.business_branches?.businesses?.id,
          name: o.business_branches?.businesses?.business_name || 'Generic Business',
          logo_url: o.business_branches?.businesses?.logo_url,
          address: o.business_branches?.city,
        },
        image_url: o.offer_media?.[0]?.image_url,
      }));

      setOffers(mappedOffers);
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOffers();
  };

  const handleParentCategorySelect = (cat: Category) => {
    setSelectedParentCategory(cat);
    setSelectedCategoryId(cat.id);
    setActiveFilterId('category');
  };

  const handleSubCategorySelect = (id: string) => {
    setSelectedCategoryId(id);
  };

  const resetCategory = () => {
    setSelectedParentCategory(null);
    setSelectedCategoryId(null);
    setActiveFilterId('all');
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Reverse geocode to get city name
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const city = data.address?.city || data.address?.town || data.address?.village || 'Your Location';

          setUserLocation({ lat: latitude, lng: longitude, city });
        } catch (error) {
          console.error('Error getting city name:', error);
          setUserLocation({ lat: latitude, lng: longitude, city: 'Your Location' });
        }
        setLocationLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to retrieve your location. Please enable location services.');
        setLocationLoading(false);
      }
    );
  };

  const redirectToPlayStore = () => {
    setShowDownloadModal(true);
  };

  const handleMouseEnter = () => {
    if (window.innerWidth <= 768) return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setShowFilterSheet(true);
  };

  const handleMouseLeave = () => {
    if (window.innerWidth <= 768) return;
    hoverTimeoutRef.current = setTimeout(() => {
      setShowFilterSheet(false);
    }, 200);
  };

  return (
    <div className="app">
      <header>
        <div className="container header-inner">
          <a href="#" className="logo" onClick={(e) => { e.preventDefault(); setActivePage('home'); resetCategory(); }}>Spot Loot</a>

          <form className="search-bar" onSubmit={handleSearch}>
            <Search size={18} color="#222" />
            <input
              type="text"
              className="search-input"
              placeholder="Search for offers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>

          <div className="header-actions">
            <button
              className="location-picker"
              onClick={detectLocation}
              disabled={locationLoading}
            >
              <MapPin size={18} />
              <span className="location-text">
                {locationLoading ? 'Detecting...' : (userLocation?.city || 'Detect Location')}
              </span>
            </button>
            <div style={{ position: 'relative' }}>
              <Bell size={24} style={{ cursor: 'pointer' }} onClick={() => setShowNotifications(true)} />
              {/* Optional: Add a red dot if there are unread notifications */}
              <div style={{ position: 'absolute', top: -2, right: 0, width: '8px', height: '8px', background: 'red', borderRadius: '50%', border: '1px solid white' }}></div>
            </div>
          </div>
        </div>
      </header>

      {activePage === 'home' ? (
        <>
          <div className="filters-container" style={{ justifyContent: 'center', padding: '10px 0' }}>
            <div
              className="container"
              style={{ display: 'flex', justifyContent: 'center' }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className={`offer-type-chip ${showFilterSheet ? 'filter-trigger-active' : ''}`}
                onClick={() => setShowFilterSheet(!showFilterSheet)}
                style={{ border: '1px solid var(--border)', background: 'white', fontWeight: 700 }}
              >
                {(activeFilterId !== 'all' || selectedParentCategory) ? (
                  <><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }}></span> Filters Applied</>
                ) : (
                  <><Tag size={16} /> Browse Categories & Offers</>
                )}
                <ChevronLeft size={16} style={{ transform: 'rotate(-90deg)' }} />
              </button>
            </div>
          </div>

          {/* Filter Sheet Overlay */}
          <div
            className={`filter-sheet-overlay ${showFilterSheet ? 'open' : ''}`}
            onClick={() => setShowFilterSheet(false)}
          >
            <div
              className={`filter-sheet ${showFilterSheet ? 'open' : ''}`}
              onClick={(e) => e.stopPropagation()}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="container filters-container-inner">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700 }}>Filter Offers</h3>
                  <button onClick={() => setShowFilterSheet(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                </div>

                {selectedParentCategory ? (
                  <div>
                    <div className="nav-back" onClick={resetCategory}>
                      <ChevronLeft size={18} />
                      Back to all categories
                    </div>
                    <div className="subcategory-bar">
                      <div
                        className={`subcategory-pill ${selectedCategoryId === selectedParentCategory.id ? 'active' : ''}`}
                        onClick={() => { handleSubCategorySelect(selectedParentCategory.id); setShowFilterSheet(false); }}
                      >
                        All {selectedParentCategory.name}
                      </div>
                      {selectedParentCategory.children?.map(sub => (
                        <div
                          key={sub.id}
                          className={`subcategory-pill ${selectedCategoryId === sub.id ? 'active' : ''}`}
                          onClick={() => { handleSubCategorySelect(sub.id); setShowFilterSheet(false); }}
                        >
                          {sub.icon} {sub.name}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="offer-types-bar">
                      <div
                        className={`offer-type-chip ${activeFilterId === 'all' ? 'active' : ''}`}
                        onClick={() => { resetCategory(); setShowFilterSheet(false); }}
                      >
                        <Tag size={16} />
                        <span>All Offers</span>
                      </div>
                      {STATIC_FILTERS.map((filter) => (
                        <div
                          key={filter.id}
                          className={`offer-type-chip ${activeFilterId === filter.id ? 'active' : ''}`}
                          onClick={() => {
                            setActiveFilterId(filter.id);
                            setSelectedCategoryId(null);
                            setShowFilterSheet(false);
                          }}
                        >
                          <filter.icon size={16} />
                          <span>{filter.name}</span>
                        </div>
                      ))}
                    </div>

                    <div className="category-bar">
                      {categories.map((cat: Category) => (
                        <div
                          key={cat.id}
                          className={`category-item ${(selectedParentCategory as any)?.id === cat.id ? 'active' : ''}`}
                          onClick={() => handleParentCategorySelect(cat)}
                        >
                          <span className="category-icon" style={{ fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {cat.icon || '📦'}
                          </span>
                          <span className="category-name">{cat.name}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="container">
            {/* Top Shops Section - Moved to Top */}
            {!selectedParentCategory && businesses.length > 0 && (
              <section className="shops-section" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                <div className="section-header">
                  <h2 className="section-title"><Store size={20} color="var(--primary)" /> Top Shops</h2>
                  <a href="#" onClick={redirectToPlayStore} style={{ fontSize: '14px', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>View All</a>
                </div>
                <div className="shops-list">
                  {businesses.map(shop => (
                    <div key={shop.id} className="shop-card" onClick={redirectToPlayStore}>
                      <div className="shop-logo-wrapper">
                        <img src={shop.logo_url || 'https://via.placeholder.com/64'} alt={shop.business_name} className="shop-logo" />
                      </div>
                      <span className="shop-name">{shop.business_name}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Offer Grid Main Content */}
            <main>
              {loading ? (
                <div style={{ padding: '80px', textAlign: 'center' }}>
                  <div className="loading-spinner"></div>
                  <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Loading amazing offers...</p>
                </div>
              ) : (
                <div>
                  <div style={{ padding: '24px 0 16px', fontSize: '20px', fontWeight: 800 }}>
                    {activeFilterId === 'hot' ? '🔥 Hot Deals' :
                      selectedParentCategory ? `${selectedParentCategory.icon || '📦'} ${selectedParentCategory.name}` : 'Latest Offers'}
                  </div>
                  <div className="offer-grid">
                    {offers.map((offer) => (
                      <div key={offer.id} className="offer-card" onClick={() => setSelectedOffer(offer)}>
                        <div className="offer-image-container">
                          <img
                            src={offer.image_url || offer.banner_url || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80'}
                            alt={offer.title}
                            className="offer-image"
                          />
                          <div className="offer-badge">
                            {offer.offer_rules?.[0]?.rule_type?.replace(/_/g, ' ') || 'HOT DEAL'}
                          </div>
                          {offer.end_date && (
                            <div style={{
                              position: 'absolute',
                              bottom: '8px',
                              right: '8px',
                              background: 'rgba(0,0,0,0.7)',
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              backdropFilter: 'blur(4px)'
                            }}>
                              <Clock size={12} />
                              {formatExpiryDate(offer.end_date)}
                            </div>
                          )}
                        </div>
                        <div className="offer-info">
                          <h3 className="offer-title">{offer.title}</h3>
                          <p className="offer-business">{offer.business?.name}</p>

                          <div className="metrics-row">
                            <div className="metric-item">
                              <Eye size={14} />
                              <span>{offer._count?.offer_views || 0}</span>
                            </div>
                            <div className="metric-item">
                              <Share2 size={14} />
                              <span>{offer._count?.offer_shares || 0}</span>
                            </div>
                          </div>

                          <div className="offer-price" style={{ marginTop: '8px' }}>
                            <span style={{ color: 'var(--primary)', fontSize: '13px' }}>{offer.offer_rules?.[0]?.rule_type?.replace(/_/g, ' ') || 'HOT DEAL'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!loading && offers.length === 0 && (
                <div style={{ padding: '80px 0', textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                  <h3>No offers found</h3>
                  <p style={{ color: 'var(--text-muted)' }}>Try changing your search or category</p>
                  <button
                    onClick={resetCategory}
                    style={{ marginTop: '20px', padding: '10px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </main>

            {!selectedParentCategory && affiliateStores.length > 0 && (
              <section className="official-stores-section">
                <div className="section-header">
                  <h2 className="section-title"><CheckCircle2 size={20} color="#1E90FF" /> Official Stores</h2>
                  <a href="#" onClick={redirectToPlayStore} style={{ fontSize: '14px', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>View All</a>
                </div>
                <div className="shops-list">
                  {affiliateStores.map(store => (
                    <div key={store.id} className="shop-card" onClick={() => store.affiliate_url && window.open(store.affiliate_url, '_blank')}>
                      <div className="shop-logo-wrapper" style={{ borderColor: store.brand_color || '#F1F2F6' }}>
                        <img src={store.logo_url || 'https://via.placeholder.com/64'} alt={store.name} className="shop-logo" />
                      </div>
                      <span className="shop-name">{store.name}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </>
      ) : (
        <div style={{ paddingTop: '32px' }}>
          {activePage === 'about' && <AboutPage />}
          {activePage === 'careers' && <CareersPage />}
          {activePage === 'contact' && <ContactPage />}
          {activePage === 'privacy' && <PrivacyPolicyPage />}
          {activePage === 'terms' && <TermsPage />}
          {activePage === 'cookie' && <CookiePolicyPage />}
        </div>
      )}

      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <h3>Spot Loot</h3>
              <p>Discover the best local offers, deals, and discounts from your favorite shops and brands. Save more, shop smart.</p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                {/* Social Icons Placeholder */}
              </div>
            </div>

            <div className="footer-column">
              <h4>Company</h4>
              <div className="footer-links">
                <a href="#" onClick={(e) => { e.preventDefault(); setActivePage('about') }} className="footer-link">About Us</a>
                <a href="#" onClick={(e) => { e.preventDefault(); setActivePage('careers') }} className="footer-link">Careers</a>
                <a href="#" onClick={(e) => { e.preventDefault(); setActivePage('contact') }} className="footer-link">Contact</a>
              </div>
            </div>

            <div className="footer-column">
              <h4>Legal</h4>
              <div className="footer-links">
                <a href="#" onClick={(e) => { e.preventDefault(); setActivePage('privacy') }} className="footer-link">Privacy Policy</a>
                <a href="#" onClick={(e) => { e.preventDefault(); setActivePage('terms') }} className="footer-link">Terms of Service</a>
              </div>
            </div>

            <div className="footer-column">
              <h4>Get the App</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href={PLAY_STORE_URL} target="_blank" className="app-btn">
                  <ShoppingBag size={18} /> Google Play
                </a>
                {/* App Store Placeholder */}
                <div className="app-btn" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                  <Tag size={18} /> App Store (Soon)
                </div>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            &copy; {new Date().getFullYear()} Spot Loot. All rights reserved.
          </div>
        </div>
      </footer>

      {selectedOffer && (
        <OfferDetailModal
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
          onAction={redirectToPlayStore}
        />
      )}

      <NotificationsSidebar isOpen={showNotifications} onClose={() => setShowNotifications(false)} />

      {showDownloadModal && (
        <DownloadModal onClose={() => setShowDownloadModal(false)} />
      )}
    </div>
  );
}

export default App;
