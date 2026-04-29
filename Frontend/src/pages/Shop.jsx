import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  SlidersHorizontal,
  View,
  ChevronDown,
  Star
} from 'lucide-react';

import styles from './Shop.module.css';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  const [activeCategory, setActiveCategory] =
    useState('All');

  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);

  const [roomDropdownOpen, setRoomDropdownOpen] =
    useState(false);

  const [selectedRoom, setSelectedRoom] =
    useState('All Rooms');

  useEffect(() => {
    fetchProducts();
  }, []);

  // ---------------- FETCH PRODUCTS ----------------
  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        'http://localhost:8080/api/products/get'
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
          item.pPrice !== null
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

  // ---------------- FILTER ----------------
  const filteredProducts =
    activeCategory === 'All'
      ? products
      : products.filter((product) =>
          (product.categories || []).some(
            (cat) =>
              cat?.pCategory ===
              activeCategory
          )
        );

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
    localStorage.setItem(
      'selectedProductId',
      id
    );

    window.location.href = `/product/${name}`;
  };

  const rating = (product) => {
    const val = Number(product.pRating);

    if (!val || val <= 0)
      return 'Unrated';

    return val.toFixed(1);
  };

  const has3DModel = (product) => {
    return (
      product.p3DModel &&
      product.p3DModel !== 'none'
    );
  };

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
        <aside className={styles.sidebar}>
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
          </div>
        </aside>

        {/* MAIN */}
        <main className={styles.mainContent}>
          {/* CONTROLS */}
          <div className={styles.controlsBar}>
            <button
              className={
                styles.mobileFilterBtn
              }
            >
              <SlidersHorizontal
                size={18}
              />
              Filters
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
                  {[
                    'All Rooms',
                    'Bedroom',
                    'Living Room',
                    'Office'
                  ].map((room) => (
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
                      ? product
                          .images[0]
                          .pImageUrl
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
                            e.target.src =
                              '/no-image.png';
                          }}
                        />

                        {/* ONLY SHOW IF 3D MODEL EXISTS */}
                        {has3DModel(
                          product
                        ) && (
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

                        <p
                          className={
                            styles.price
                          }
                        >
                          {
                            product.pPrice
                          }{' '}
                          DZD
                        </p>

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