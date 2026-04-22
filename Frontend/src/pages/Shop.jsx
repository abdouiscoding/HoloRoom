import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SlidersHorizontal, View, ChevronDown, Heart, Star } from 'lucide-react';
import styles from './Shop.module.css';
import { useWishlist } from '../context/WishlistContext';
import { useReviews } from '../context/ReviewsContext';
import ReviewModal from '../components/product/ReviewModal';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [reviewProduct, setReviewProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const { toggleWishlist, isInWishlist } = useWishlist();
  const { getReviews } = useReviews();

  useEffect(() => {
    fetchProducts();
  }, []);

  // ---------------- FETCH ALL PRODUCTS ----------------
  const fetchProducts = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:8080/api/products/get",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : ""
          }
        }
      );

      if (!response.ok) {
        setProducts([]);
        return;
      }

      const data = await response.json();
      setProducts(data || []);

    } catch (error) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- CATEGORIES (SAFE) ----------------
  const dbCategories = [
    ...new Set(
      products.flatMap(product =>
        (product.categories || []).map(cat => cat?.pCategory)
      )
    )
  ].filter(Boolean);

  const CATEGORIES = ['All', ...dbCategories];

  // ---------------- FILTERING (SAFE) ----------------
  const filteredProducts =
    activeCategory === 'All'
      ? products
      : products.filter(product =>
          (product.categories || []).some(
            cat => cat?.pCategory === activeCategory
          )
        );
  
  const Search = (value) => {
    setSearch(value);

    if (!value.trim()) {
      fetchProducts();
      return;
    }
    
    const filtered = products.filter(product =>
      product.pName.toLowerCase().includes(value.toLowerCase())
    );
    setProducts(filtered);
  };      

  const toproductpage = (name, id) => {
    localStorage.setItem("selectedProductId", id);
    window.location.href = `/product/${name}`;
  };

  const rating = (product) => {
  const val = Number(product.pRating);
  if (!val || val <= 0) {
    return "Unrated";
  }
  return val.toFixed(1);
  };

  return (
    <div className={styles.shopContainer}>

      {/* HEADER */}
      <div className={styles.shopHeader}>
        <div className="container">
          <h1 className="text-gradient">Explore Collection</h1>
          <p>Discover items that perfect your space. Try them in AR.</p>
        </div>
      </div>

      <div className={`container ${styles.shopLayout}`}>

        {/* SIDEBAR */}
        <aside className={styles.sidebar}>
          <div className={`${styles.filterBlock} glass-panel`}>
            <div className={styles.filterHeader}>
              <h3>Categories</h3>
            </div>

            <ul className={styles.categoryList}>
              {CATEGORIES.map(cat => (
                <li key={cat}>
                  <button
                    className={`${styles.categoryBtn} ${
                      activeCategory === cat ? styles.active : ''
                    }`}
                    onClick={() => setActiveCategory(cat)}
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

            <button className={styles.mobileFilterBtn}>
              <SlidersHorizontal size={18} /> Filters
            </button>

            {/* SEARCH INPUT */}
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => Search(e.target.value)}
              className={styles.searchInput}
            />

            <div className={styles.sortDropdown}>
              <span>Sort by:</span>
              <button className={styles.sortBtn}>
                Recommended <ChevronDown size={16} />
              </button>
            </div>

          </div>

          {/* LOADING */}
          {loading ? (
            <h2 style={{ textAlign: "center" }}>Loading products...</h2>
          ) : (

            <div className={styles.productGrid}>
              {filteredProducts.map(product => {

                const firstImage =
                  product.images?.length > 0
                    ? product.images[0].pImageUrl
                    : "https://via.placeholder.com/300";

                const firstCategory =
                  product.categories?.length > 0
                    ? product.categories[0].pCategory
                    : "General";

                return (
                  <div
                    key={product.pId}
                    className={styles.productCard}
                  >

                    <div className={styles.imageWrapper}>
                      <img
                        src={firstImage}
                        alt={product.pName}
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/300";
                        }}
                      />

                      {/* Wishlist */}
                      <div className={styles.wishlistContainer}>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleWishlist(product);
                        }}
                        className={styles.wishlistBtn}
                      >
                        <Heart
                          size={18}
                          fill={
                            isInWishlist(product.pId)
                              ? "var(--accent-primary)"
                              : "none"
                          }
                          color={
                            isInWishlist(product.pId)
                              ? "var(--accent-primary)"
                              : "black"
                          }
                        />
                      </button>
                      </div>
                      <div className={styles.arBadge}>
                        <View size={14} /> 3D/AR
                      </div>

                      <div className={styles.cardActions}>
                        <Link
                          onClick={() => toproductpage(product.pName, product.pId)}
                          className={styles.quickViewBtn}
                        >
                          View Details
                        </Link>
                      </div>
                    </div>

                    <div className={styles.productInfo}>
                      <span className={styles.category}>
                        {firstCategory}
                      </span>

                      <h3>
                        <Link onClick={() => toproductpage(product.pName, product.pId)}>
                          {product.pName}
                        </Link>
                      </h3>

                      <p className={styles.price}>
                        {product.pPrice} DZD
                      </p>

                      <div
                        className={styles.reviewRow}
                        onClick={() => setReviewProduct(product)}
                      >
                        <span>{rating(product)}</span>
                        <Star size={12} fill="gold" color="gold" />
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <ReviewModal
        isOpen={!!reviewProduct}
        onClose={() => setReviewProduct(null)}
        product={reviewProduct}
      />
    </div>
  );
};

export default Shop;