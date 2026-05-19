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

useEffect(() => {
  let filtered = [...allProducts];

  // CATEGORY
  if (activeCategory !== 'All') {
    filtered = filtered.filter((product) =>
      (product.categories || []).some(
        (cat) => cat?.pCategory === activeCategory
      )
    );
  }

  // PRICE FILTER (final price)
  const min = parseFloat(minPrice);
  const max = parseFloat(maxPrice);

  if (!isNaN(min)) {
    filtered = filtered.filter(
      (p) => Number(p.pFinalPrice) >= min
    );
  }

  if (!isNaN(max)) {
    filtered = filtered.filter(
      (p) => Number(p.pFinalPrice) <= max
    );
  }

  // SORT
  const sorted = sortProducts(selectedRoom, filtered);

  setProducts(sorted);
}, [
  allProducts,
  activeCategory,
  selectedRoom,
  minPrice,
  maxPrice
]);

const resetPriceFilter = () => {
  setMinPrice('');
  setMaxPrice('');
};

  // ---------------- SEARCH ----------------
  const Search = (value) => {
    setSearch(value);

    if (!value.trim()) {
      setProducts(allProducts);
      return;
    }

    const filtered = allProducts.filter(
      (product) =>
        product.pName
          ?.toLowerCase()
          .includes(value.toLowerCase())
    );

    setProducts(filtered);
  };

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
    const { action, type, min, max, query } = e.detail || {};
    console.log("AI FILTER RECEIVED:", e.detail);

    // helper — type can refine ANY action; fall back to search if no category match
    const applyType = (t) => {
      if (!t || t.toLowerCase() === "none") return;
      const matchedCat = CATEGORIES.find(c => c.toLowerCase() === t.toLowerCase());
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
      setMinPrice('');
      setMaxPrice('');
      setActiveCategory('All');
      setSelectedRoom('Standard');
      setSearch('');
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
              {filteredProducts.map(
                (product) => {
                  const firstImage =
                    product.images
                      ?.length > 0 &&
                    product.images[0]
                      ?.pImageUrl
                      ? encodeURI(
                          product
                            .images[0]
                            .pImageUrl
                        )
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