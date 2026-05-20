import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  SlidersHorizontal,
  View,
  ChevronDown,
  Star
} from 'lucide-react';
import { Sparkles } from 'lucide-react';

import styles from './Shop.module.css';
import { API, address, myFetch } from "../api";

const Shop = () => {
  const NAMED_COLORS = {
    black: '#000000', white: '#ffffff', red: '#ff0000', green: '#008000',
    blue: '#0000ff', yellow: '#ffff00', orange: '#ffa500', purple: '#800080',
    pink: '#ffc0cb', brown: '#8b4513', gray: '#808080', grey: '#808080',
    cyan: '#00ffff', magenta: '#ff00ff', beige: '#f5f5dc', gold: '#ffd700',
    silver: '#c0c0c0', navy: '#000080', maroon: '#800000', teal: '#008080',
    olive: '#808000', cream: '#fffdd0', tan: '#d2b48c', ivory: '#fffff0',
    charcoal: '#36454f', mint: '#98ff98', lavender: '#e6e6fa',
    turquoise: '#40e0d0', coral: '#ff7f50', salmon: '#fa8072',
    indigo: '#4b0082', violet: '#ee82ee', khaki: '#f0e68c'
  };

  const hexToRgb = (hex) => {
    if (!hex) return null;
    let h = hex.toString().toLowerCase().replace('#', '').trim();
    if (h.length === 3) h = h.split('').map(c => c + c).join(''); // expand #f00 → #ff0000
    if (h.length < 6) h = h.padEnd(6, '0');
    h = h.slice(0, 6);
    const n = parseInt(h, 16);
    if (isNaN(n)) return null;
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  };

  const toHex = (input) => {
    if (!input) return null;
    const s = input.toString().toLowerCase().trim();
    if (s.startsWith('#') || /^[0-9a-f]{3,8}$/.test(s)) return s.startsWith('#') ? s : '#' + s;
    return NAMED_COLORS[s] || null;
  };

  const COLOR_THRESHOLD = 150; // RGB euclidean distance 

  const colorMatches = (productColor, queryColor) => {
    if (!productColor || !queryColor) return false;

    const pHex = toHex(productColor);
    const qHex = toHex(queryColor);

    // If either side isn't resolvable as a color, fall back to text compare
    if (!pHex || !qHex) {
      return productColor.toString().toLowerCase().includes(queryColor.toString().toLowerCase());
    }

    const a = hexToRgb(pHex);
    const b = hexToRgb(qHex);
    if (!a || !b) return false;

    const dist = Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
    return dist < COLOR_THRESHOLD;
  };

  // Canonical color buckets — what shoppers actually think in
  const COLOR_BUCKETS = {
    Black: '#000000', White: '#ffffff', Gray: '#808080',
    Red: '#e63946', Orange: '#ffa500', Yellow: '#ffd60a',
    Green: '#2a9d3f', Blue: '#1e6fff', Purple: '#7c3aed',
    Pink: '#ff6fa3', Brown: '#8b4513', Beige: '#e9d8b8',
    Navy: '#0a2540', Gold: '#d4af37'
  };

  // Bucket any raw color (hex/name) to the nearest bucket name
  const colorToBucket = (raw) => {
    if (!raw) return null;
    const hex = toHex(raw);
    if (!hex) return null;
    const rgb = hexToRgb(hex);
    if (!rgb) return null;
    let closest = null;
    let minDist = Infinity;
    for (const [name, bHex] of Object.entries(COLOR_BUCKETS)) {
      const brgb = hexToRgb(bHex);
      if (!brgb) continue;
      const d = (rgb.r - brgb.r) ** 2 + (rgb.g - brgb.g) ** 2 + (rgb.b - brgb.b) ** 2;
      if (d < minDist) { minDist = d; closest = name; }
    }
    return closest;
  };

  // Bucket any size text into Small/Medium/Large
  const sizeToBucket = (raw) => {
    if (!raw) return null;
    const s = raw.toString().toLowerCase().trim();
    if (['s', 'sm', 'xs'].includes(s)) return 'Small';
    if (['m', 'md', 'med'].includes(s)) return 'Medium';
    if (['l', 'lg', 'xl', 'xxl'].includes(s)) return 'Large';
    if (s.includes('small') || s.includes('tiny') || s.includes('mini')) return 'Small';
    if (s.includes('large') || s.includes('big') || s.includes('huge') || s.includes('xl')) return 'Large';
    if (s.includes('medium') || s.includes('med') || s.includes('mid') || s.includes('regular') || s.includes('standard')) return 'Medium';
    return 'Medium'; // safe default for free-form dimensions
  };
  
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  const [activeCategory, setActiveCategory] =
    useState('All');

  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);

  const [roomDropdownOpen, setRoomDropdownOpen] =
    useState(false);

  const [selectedRoom, setSelectedRoom] =
    useState('Standard');

  const [discounts, setDiscounts] = useState([]); 
  const [globalDiscount, setglobalDiscount] = useState(0);

  const resetAllFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setActiveCategory('All');
    setSelectedRoom('Standard');
    setSearch('');
    setSelectedColor('');
    setSelectedSize('');
  };

  // ---------------- FETCH PRODUCTS ----------------
  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await myFetch(
        `${API}/api/products/get`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true', 
          'Content-Type': 'application/json'
        }}
      );

      if (!response.ok) {
        setProducts([]);
        setAllProducts([]);
        return;
      }

      const data = await response.json();

      const cleanProducts = (data || []).filter(
        (item) =>
          item &&
          item.pId &&
          item.pName &&
          item.pFinalPrice !== null
      );

      setProducts(cleanProducts);
      setAllProducts(cleanProducts);
    } catch (error) {
      console.error(error);
      setProducts([]);
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const colorBuckets = [...new Set(
    allProducts.flatMap(p => (p.sizecolorstock || []).map(v => colorToBucket(v?.pColor)))
  )].filter(Boolean);

  // Force a stable Small/Medium/Large order if those buckets exist
  const sizeOrder = ['Small', 'Medium', 'Large'];
  const sizeBuckets = sizeOrder.filter(b =>
    allProducts.some(p => (p.sizecolorstock || []).some(v => sizeToBucket(v?.pSize) === b))
  );

  // ---------------- CATEGORIES ----------------
  const dbCategories = [
    ...new Set(
      allProducts.flatMap((product) =>
        (product.categories || []).map(
          (cat) => cat?.pCategory
        )
      )
    )
  ].filter(Boolean);

  const CATEGORIES = ['All', ...dbCategories];

  // ---------------- FILTERS ----------------
  const filteredProducts =
    activeCategory === 'All'
      ? products
      : products.filter((product) =>
          (product.categories || []).some(
            (cat) =>
              cat?.pCategory === activeCategory
          )
        );
// ---------------- SORT FUNCTIONS ----------------
const sortProducts = (type, list) => {
  let sorted = [...list];

  switch (type) {
    case 'Reviews':
      sorted.sort((a, b) => (b.pRating || 0) - (a.pRating || 0));
      break;
    case 'Most wished for':
      sorted.sort((a, b) => (b.pWishes || 0) - (a.pWishes || 0));
      break;
    case 'Top selling':
      sorted.sort((a, b) => (b.pSold || 0) - (a.pSold || 0));
      break;
    case 'Price low':
      sorted.sort((a, b) => (Number(a.pFinalPrice) || 0) - (Number(b.pFinalPrice) || 0));
      break;
    case 'Price high':
      sorted.sort((a, b) => (Number(b.pFinalPrice) || 0) - (Number(a.pFinalPrice) || 0));
      break;
    case 'Discounts':
      return list
        .filter(p => (calctotaldis(p.pDiscount) || 0) > 0)
        .sort((a, b) => (calctotaldis(b.pDiscount) || 0) - (calctotaldis(a.pDiscount) || 0));
    case 'Standard':
    default:
      return list;
  }
  return sorted;
};

// ---------------- MAIN FILTER PIPELINE ----------------
useEffect(() => {
  let filtered = [...allProducts];

  // CATEGORY
  if (activeCategory !== 'All') {
    const ac = activeCategory.toLowerCase();
    filtered = filtered.filter((product) =>
      (product.categories || []).some(cat => {
        const cLow = (cat?.pCategory || '').toLowerCase();
        return cLow === ac || cLow.includes(ac) || ac.includes(cLow);
      })
    );
  }

  // SEARCH
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p => p.pName?.toLowerCase().includes(q));
  }

  if (selectedColor) {
    filtered = filtered.filter(p =>
      (p.sizecolorstock || []).some(v => colorToBucket(v?.pColor) === selectedColor)
    );
  }

  if (selectedSize) {
    filtered = filtered.filter(p =>
      (p.sizecolorstock || []).some(v => sizeToBucket(v?.pSize) === selectedSize)
    );
  }

  // PRICE
  const min = parseFloat(minPrice);
  const max = parseFloat(maxPrice);
  if (!isNaN(min)) filtered = filtered.filter(p => Number(p.pFinalPrice) >= min);
  if (!isNaN(max)) filtered = filtered.filter(p => Number(p.pFinalPrice) <= max);

  // SORT
  const sorted = sortProducts(selectedRoom, filtered);
  setProducts(sorted);
}, [allProducts, activeCategory, selectedRoom, minPrice, maxPrice, search, selectedColor, selectedSize]);

const resetPriceFilter = () => {
  setMinPrice('');
  setMaxPrice('');
};

// ---------------- SEARCH ----------------
const Search = (value) => setSearch(value);

const toproductpage = (name, id) => {
  const safeName = encodeURIComponent(name);

  localStorage.setItem("selectedProductId", id);
  window.location.href = `/product/${safeName}`;
};

  const rating = (product) => {
    const val = Number(product.pRating);

    if (!val || val <= 0)
      return 'Unrated';

    return val.toFixed(1);
  };

useEffect(() => {
  const handleAISearch = (e) => {
    const { action, type, color, size, min, max, query } = e.detail || {};

    const isNoType = (t) => {
      if (t === null || t === undefined || t === '') return true;
      const s = t.toString().toLowerCase().trim();
      return [
        'none', 'null', 'undefined',
        'all', 'any', 'everything', 'anything',
        'products', 'items', 'things', 'stuff'
      ].includes(s);
    };

    const applyType = (t) => {
      if (isNoType(t)) return;
      const tLow = t.toLowerCase();
      const matchedCat = CATEGORIES.find(c => {
        const cLow = c.toLowerCase();
        return cLow === tLow || cLow.includes(tLow) || tLow.includes(cLow);
      });
      if (matchedCat) {
        setActiveCategory(matchedCat);
        setSearch('');
      } else {
        setActiveCategory('All');
        setSearch(t);
      }
    };

    // CANCEL / RESET
    if (action === "cancel") {
      resetAllFilters();
      return;
    }

    // PRICE RANGE
    if (action === "price") {
      if (min != null) setMinPrice(min.toString());
      if (max != null) setMaxPrice(max.toString());
      applyType(type);
    }

    // SEARCH / CATEGORY
    if (action === "search" || action === "category") {
      applyType(type || query);
    }

    // SORTS — combinable with type
    const sortMap = {
      top_selling: "Top selling",
      most_wished: "Most wished for",
      reviews: "Reviews",
      discounts: "Discounts",
      price_low: "Price low",
      price_high: "Price high",
    };
    if (sortMap[action]) {
      setSelectedRoom(sortMap[action]);
      applyType(type);
    }

    if (color !== undefined && color !== null && color !== '') {
      const bucket = colorToBucket(color) || (color.charAt(0).toUpperCase() + color.slice(1).toLowerCase());
      setSelectedColor(bucket);
      if (action === "color" && isNoType(type)) {
        resetAllFilters();
      }
    }

  if (action === "color") {
    applyType(type);
  }

  if (size !== undefined && size !== null && size !== '') {
    const bucket = sizeToBucket(size);
    if (bucket) setSelectedSize(bucket);
    if (action === "size" && isNoType(type)) {
      resetAllFilters();  
    }
  }

  if (action === "size") {
    applyType(type);
  }
  };

  window.addEventListener("ai-search", handleAISearch);
  return () => window.removeEventListener("ai-search", handleAISearch);
}, [allProducts, CATEGORIES]);

const fetchDiscounts = async () => {
  try {
    const res = await myFetch(`${API}/api/discounts/active`);
    const data = await res.json();

    setDiscounts(data || []);

    let total = 0;

    (data || [])
      .filter(d => d.active && d.productId == null)
      .forEach(d => {
        total += d.percentage || 0;
      });

    // cap at 80%
    total = Math.min(total, 80);

    setglobalDiscount(total);

  } catch (e) {
    console.error(e);
    setDiscounts([]);
    setglobalDiscount(0);
  }
};

const calctotaldis = (productDiscount) => {
  return Math.min(productDiscount + globalDiscount,80);
};

useEffect(() => {
  fetchProducts();
  fetchDiscounts();
}, []);

  return (
    <div className={styles.shopContainer}>
      {/* HEADER */}
      <div className={styles.shopHeader}>
        <div className="container">
          <h1 className="text-gradient">
            Explore Collection
          </h1>

          <p>
            Discover items that perfect
            your space. Try them in AR.
          </p>
        </div>
      </div>

      <div
        className={`container ${styles.shopLayout}`}
      >
        {/* SIDEBAR */}
        <aside className={`${styles.sidebar} ${mobileFiltersOpen ? styles.sidebarMobileOpen : ''}`}>
          <button
            onClick={resetAllFilters}
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '12px',
              borderRadius: '10px',
              border: '1px solid var(--border-glass)',
              background: 'var(--accent-secondary)',
              color: '#000',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Clear All Filters
          </button>
          <div
            className={`${styles.filterBlock} glass-panel`}
          >
            <div
              className={
                styles.filterHeader
              }
            >
              <h3>Categories</h3>
            </div>

            <ul
              className={
                styles.categoryList
              }
            >
              {CATEGORIES.map((cat) => (
                <li key={cat}>
                  <button
                    className={`${styles.categoryBtn} ${
                      activeCategory ===
                      cat
                        ? styles.active
                        : ''
                    }`}
                    onClick={() =>
                      setActiveCategory(
                        cat
                      )
                    }
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
            {/* PRICE FILTER */}
            <div className={styles.filterBlock}>
              <div className={styles.filterHeader}>
                <h3>Price</h3>
              </div>

              <div className={styles.priceInputs}>
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className={styles.input}
                />

                <span style={{ color: 'var(--text-secondary)' }}>-</span>

                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className={styles.input}
                />
              </div>

              <button
                onClick={resetPriceFilter}
                style={{
                  marginTop: '10px',
                  width: '100%',
                  padding: '6px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-glass)',
                  background: 'var(--bg-glass)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                Reset Price
              </button>
            </div>
            <div className={styles.filterBlock}>
              <div className={styles.filterHeader}>
                <h3>Color</h3>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {colorBuckets.map(name => (
                  <button
                    key={name}
                    title={name}
                    onClick={() => setSelectedColor(selectedColor === name ? '' : name)}
                    style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      border: selectedColor === name ? '3px solid var(--accent-secondary)' : '1px solid #ccc',
                      background: COLOR_BUCKETS[name],
                      cursor: 'pointer'
                    }}
                  />
                ))}
                {selectedColor && (
                  <button
                    onClick={() => setSelectedColor('')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-glass)',
                      background: 'transparent',
                      color: 'var(--text-secondary)',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >Clear {selectedColor}</button>
                )}
              </div>
            </div>
            {sizeBuckets.length > 0 && (
              <div className={styles.filterBlock}>
                <div className={styles.filterHeader}><h3>Size</h3></div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {sizeBuckets.map(name => (
                    <button
                      key={name}
                      onClick={() => setSelectedSize(selectedSize === name ? '' : name)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        border: selectedSize === name ? '2px solid var(--accent-secondary)' : '1px solid var(--border-glass)',
                        background: selectedSize === name ? 'var(--accent-secondary)' : 'transparent',
                        color: selectedSize === name ? '#000' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: '600'
                      }}
                    >{name}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* MAIN */}
        <main className={styles.mainContent}>
          {/* CONTROLS */}
          <div className={styles.controlsBar}>
            <button
              className={styles.mobileFilterBtn}
              onClick={() => setMobileFiltersOpen(o => !o)}
            >
              <SlidersHorizontal size={18} />
              Filters {mobileFiltersOpen ? '▲' : '▼'}
            </button>

            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) =>
                Search(
                  e.target.value
                )
              }
              className={
                styles.searchInput
              }
            />

            <div
              className={
                styles.sortDropdown
              }
            >
              <span>Sort by:</span>

              <button
                className={
                  styles.sortBtn
                }
                onClick={() =>
                  setRoomDropdownOpen(
                    !roomDropdownOpen
                  )
                }
              >
                {selectedRoom}

                <ChevronDown
                  size={16}
                  className={
                    roomDropdownOpen
                      ? styles.chevronOpen
                      : ''
                  }
                />
              </button>

              {roomDropdownOpen && (
                <div
                  className={
                    styles.sortMenu
                  }
                >
                  {['Standard', 'Discounts', 'Reviews', 'Most wished for', 'Top selling', 'Price low', 'Price high'].map((room) => (
                    <button
                      key={room}
                      className={`${styles.sortMenuItem} ${
                        selectedRoom ===
                        room
                          ? styles.sortMenuItemActive
                          : ''
                      }`}
                      onClick={() => {
                        setSelectedRoom(
                          room
                        );
                        setRoomDropdownOpen(
                          false
                        );
                      }}
                    >
                      {room}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* DISCOUNT BANNER */}
          {discounts.filter(d => !d.productId).length > 0 && (
            <div className={styles.discountBanner}>
              {discounts
                .filter(d => !d.productId)
                .map((d, i) => (
                  <div key={i} className={styles.discountCard}>
                    <Sparkles size={16} />
                    <span>{d.name}</span>
                    <b>-{d.percentage}%</b>
                  </div>
                ))}
            </div>
          )}

          {/* PRODUCTS */}
          {loading ? (
            <h2
              style={{
                textAlign:
                  'center'
              }}
            >
              Loading products...
            </h2>
          ) : (
            <div
              className={
                styles.productGrid
              }
            >
              {products.map((product) => {
                const firstImage =
                  product.images?.length > 0 && product.images[0]?.pImageUrl
                    ? encodeURI(product.images[0].pImageUrl)
                    : '/no-image.png';

                  const firstCategory =
                    product
                      .categories
                      ?.length > 0
                      ? product
                          .categories[0]
                          .pCategory
                      : 'General';

                  return (
                    <div
                      key={
                        product.pId
                      }
                      className={
                        styles.productCard
                      }
                    >
                      <div
                        className={
                          styles.imageWrapper
                        }
                      >
                        <img
                          src={
                            firstImage
                          }
                          alt={
                            product.pName
                          }
                          onError={(
                            e
                          ) => {
                            console.log(
                              'Image failed:',
                              firstImage
                            );
                            e.target.src =
                              '/no-image.png';
                          }}
                        />

                       {calctotaldis(product.pDiscount) > 0 && (
                        <div className={styles.discountBadge}>
                          <Sparkles size={14} />
                          -{calctotaldis(product.pDiscount)}% 
                        </div>
                      )}        


                        {/* 3D MODEL BADGE */}
                        {product.pARSupport && (
                          <div
                            className={
                              styles.arBadge
                            }
                          >
                            <View
                              size={
                                14
                              }
                            />
                            3D/AR
                          </div>
                        )}

                        <div
                          className={
                            styles.cardActions
                          }
                        >
                          <Link
                            onClick={() =>
                              toproductpage(
                                product.pName,
                                product.pId
                              )
                            }
                            className={
                              styles.quickViewBtn
                            }
                          >
                            View
                            Details
                          </Link>
                        </div>
                      </div>

                      <div
                        className={
                          styles.productInfo
                        }
                      >
                        <span
                          className={
                            styles.category
                          }
                        >
                          {
                            firstCategory
                          }
                        </span>

                        <h3>
                          <Link
                            onClick={() =>
                              toproductpage(
                                product.pName,
                                product.pId
                              )
                            }
                          >
                            {
                              product.pName
                            }
                          </Link>
                        </h3>

                        <div className={styles.priceBlock}>
                          {calctotaldis(product.pDiscount) > 0 ? (
                            <>
                              <span className={styles.finalPrice}>
                                {product.pFinalPrice} DZD
                              </span>

                              <span className={styles.oldPrice}>
                                {product.pPrice} DZD
                              </span>
                            </>
                          ) : (
                            <span className={styles.finalPrice}>
                              {product.pFinalPrice} DZD
                            </span>
                          )}
                        </div>

                        <div
                          className={
                            styles.reviewRow
                          }
                        >
                          <span>
                            {rating(
                              product
                            )}
                          </span>

                          <Star
                            size={
                              12
                            }
                            fill="gold"
                            color="gold"
                          />
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Shop;