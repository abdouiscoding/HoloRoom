import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  View,
  ShoppingBag,
  ArrowLeft,
  Star,
  Check,
  Heart
} from 'lucide-react';

import styles from './ProductDetail.module.css';
import { useReviews } from '../context/ReviewsContext';
import ReviewModal from '../components/product/ReviewModal';
import { API, address, myFetch } from "../api";


const ProductDetail = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [hoveredHeart, setHoveredHeart] = useState(false);

  const [activeImage, setActiveImage] = useState(0);
  const [activeVariant, setActiveVariant] = useState(0);
  const [isReviewOpen, setIsReviewOpen] = useState(false);


  const [showPopup, setShowPopup] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [popupMode, setPopupMode] = useState('ok');
  const [globalDiscount, setglobalDiscount] = useState(0);

  const { id } = useParams();
  const navigate = useNavigate();

  const { getReviews, getAverageRating } = useReviews();

  const fetchDiscounts = async () => {
  try {
    const res = await myFetch(`${API}/api/discounts/active`);
    const data = await res.json();

    let total = 0;

    (data || [])
      .filter(d => d.active && d.productId == null)
      .forEach(d => {
        total += d.percentage || 0;
      });

    total = Math.min(total, 80);

    setglobalDiscount(total);
  } catch (e) {
    console.error(e);
    setglobalDiscount(0);
  }
};
  // ---------------- PRODUCT ----------------
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);

        const productId =
          localStorage.getItem('selectedProductId') || id;

        const response = await myFetch(
          `${API}/api/products/get/${productId}`
        );

        if (response.ok) {
          const data = await response.json();
          setProduct(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
    fetchDiscounts();
  }, [id]);

  // ---------------- CHECK WISHLIST ----------------
  useEffect(() => {
    if (!product) return;

    const checkWishlist = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');

        if (!userId || !token) return;

        const response = await myFetch(
          `${API}/api/wishlist/get/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!response.ok) return;

        const data = await response.json();

        const pid = Number(product.pId);

        const found = data.wishlistItems?.some(
          (item) => Number(item.pId) === pid
        );

        setIsWishlisted(found);
      } catch (error) {
        console.error(error);
      }
    };

    checkWishlist();
  }, [product]);

  if (loading) {
    return (
      <div
        className="container"
        style={{
          padding: '5rem',
          textAlign: 'center'
        }}
      >
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!product) {
    return (
      <div
        className="container"
        style={{
          padding: '5rem',
          textAlign: 'center'
        }}
      >
        <h2>Product not found.</h2>
      </div>
    );
  }

  const back = () => {
    localStorage.removeItem('selectedProductId');
    navigate(-1);
  };

  const openPopup = (title, message, mode = 'ok') => {
    setPopupTitle(title);
    setPopupMessage(message);
    setPopupMode(mode);
    setShowPopup(true);
  };

  // ---------------- WISHLIST ----------------
  const addToWishlist = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');

      const pid = product.pId;

      if (!userId || !token) {
        openPopup(
          'Session Expired',
          'Session expired, log in to continue.',
          'login'
        );
        return;
      }

      setWishlistLoading(true);

      const response = await myFetch(
        `${API}/api/wishlist/add/${userId}/${pid}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const text = await response.text();

      if (response.status === 201 || response.ok) {
        setIsWishlisted(true);

        openPopup(
          'Wishlist',
          'Item added to wishlist successfully.',
          'ok'
        );
      } else if (
        response.status === 409 ||
        text.toLowerCase().includes('exists')
      ) {
        setIsWishlisted(true);

        openPopup(
          'Wishlist',
          'This item is already in your wishlist, do you want to remove it?',
          'remove'
        );
      } else if (
        response.status === 403 ||
        text.toLowerCase().includes('invalid token')
      ) {
        openPopup(
          'Session Expired',
          'Session expired, log in to continue.',
          'login'
        );
      } else {
        openPopup(
          'Error',
          text || 'Failed to add item.',
          'ok'
        );
      }
    } catch (error) {
      openPopup(
        'Error',
        'Something went wrong.',
        'ok'
      );
    } finally {
      setWishlistLoading(false);
    }
  };

  // ---------------- REMOVE WISHLIST ----------------
  const removeWishlist = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');

      if (!userId || !token) {
        openPopup(
          'Session Expired',
          'Session expired, log in to continue.',
          'login'
        );
        return;
      }

      // get wishlist first
      const getRes = await myFetch(
        `${API}/api/wishlist/get/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await getRes.json();

      const item = data.wishlistItems?.find(
        (x) => Number(x.pId) === Number(product.pId)
      );

      if (!item) {
        openPopup(
          'Error',
          'Wishlist item not found.',
          'ok'
        );
        return;
      }

      const removeRes = await myFetch(
        `${API}/api/wishlist/remove/${userId}/${item.wItemId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (removeRes.ok) {
        setIsWishlisted(false);

        openPopup(
          'Wishlist',
          'Item removed from wishlist.',
          'ok'
        );
      } else {
        const txt = await removeRes.text();

        openPopup(
          'Error',
          txt || 'Failed to remove item.',
          'ok'
        );
      }
    } catch (error) {
      openPopup(
        'Error',
        'Failed to remove item.',
        'ok'
      );
    }
  };

  // ---------------- PRODUCT DATA ----------------
  const rawVariants =
    product.sizecolorstock || [];

  const variants = rawVariants.filter(
    (v, index, self) =>
      index ===
      self.findIndex(
        (t) => t.pColor === v.pColor
      )
  );

  const selectedVariant =
    variants[activeVariant];

  const stock =
    selectedVariant?.pStock ??
    0;

  const images =
    product.images &&
      product.images.length > 0
      ? product.images.map(
        (img) => img.pImageUrl
      )
      : ['/no-image.png'];

  const hasAR = !!product?.pARSupport;

  // ---------------- REVIEWS ----------------
  const reviews =
    getReviews(product.pId) || [];

  const avgRating =
    parseFloat(
      getAverageRating(product.pId)
    ) || 0;

  const stars = [1, 2, 3, 4, 5];

  // ---------------- CART ----------------
  const addtocart = async () => {
    if (!selectedVariant) {
      openPopup(
        'Select a color',
        'Please select a color to continue',
        'ok'
      );
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      // ---------------- SESSION CHECK ----------------
      if (!userId || !token) {
        openPopup(
          'Session Expired',
          'Session expired, log in to continue.',
          'login'
        );
        return;
      }

      // ---------------- GET CART ----------------
      const cartRes = await myFetch(
        `${API}/api/cart/getbyuser/${userId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (!cartRes.ok) {
        openPopup(
          'Error',
          'Failed to load cart.',
          'ok'
        );
        return;
      }

      const cartData = await cartRes.json();
      const cartId = cartData.pCartId;

      if (!cartId) {
        openPopup(
          'Error',
          'Cart not found.',
          'ok'
        );
        return;
      }

      // ---------------- ADD ITEM ----------------
      const requestBody = {
        pId: product.pId.toString(),
        pscsId: selectedVariant.pscsId.toString(),
        pImageId:
          product.images?.[activeImage]?.pImageId?.toString() || '0',
        quantity: '1'
      };

      const response = await myFetch(
        `${API}/api/cart/additem/${cartId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(requestBody)
        }
      );

      const text = await response.text();

      if (response.status === 401 || response.status === 403) {
        openPopup(
          'Session Expired',
          'Session expired, log in to continue.',
          'login'
        );
        return;
      }

      // ---------------- SUCCESS ----------------
      if (response.ok) {
        openPopup(
          'Cart',
          'Item added to cart successfully.',
          'ok'
        );
      }
      else {
        openPopup(
          'Error',
          text || 'Failed to add item to cart.',
          'ok'
        );
      }

    } catch (error) {
      console.error(error);
      openPopup(
        'Error',
        'Something went wrong.',
        'ok'
      );
    }
  };

  // ---------------- AR NAVIGATION ----------------
const openAR = () => {
  const isLoggedIn = localStorage.getItem("loggedin");

  if (!isLoggedIn || isLoggedIn === "false") {
    setShowPopup(true);
    setPopupTitle("Please Log In to use AR");
    setPopupMessage("To preview this product in AR, please log in to your account.");
    setPopupMode("login");
    return;
  }

  const productId = product?.pId;
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const loggedin = localStorage.getItem("loggedin");

  if (!productId || !token || !userId || !loggedin) {
    setPopupTitle("Please Log In");
    setPopupMessage("Required information is missing. Please log in to access AR.");
    setPopupMode("login"); 
    setShowPopup(true);
    return;
  }

  const arUrl =
    `https://holoroom-ar.vercel.app/` +
    `?token=${encodeURIComponent(token)}` +
    `&userId=${encodeURIComponent(userId)}` +
    `&productId=${encodeURIComponent(productId)}`;

  window.location.href = arUrl;
};



const calctotaldis = (productDiscount) => {
  return Math.min((productDiscount || 0) + globalDiscount, 80);
};

  return (
    <div
      className={`container ${styles.productContainer}`}
    >
      <button
        onClick={back}
        className={styles.backBtn}
      >
        <ArrowLeft size={18} />
        Back to Shop
      </button>

      <div className={styles.productGrid}>
        {/* LEFT */}
        <div className={styles.gallery}>
          <div
            className={
              styles.mainImageWrapper
            }
          >
            <img
              src={images[activeImage]}
              alt={product.pName}
              className={
                styles.mainImage
              }
            />
          </div>

          <div
            className={
              styles.thumbnailList
            }
          >
            {images.map(
              (img, idx) => (
                <button
                  key={idx}
                  className={`${styles.thumbnailWrapper} ${activeImage === idx
                      ? styles.activeThumb
                      : ''
                    }`}
                  onClick={() =>
                    setActiveImage(idx)
                  }
                >
                  <img
                    src={img}
                    alt="thumb"
                  />
                </button>
              )
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className={styles.info}>
          <div
            style={{
              display: 'flex',
              justifyContent:
                'space-between',
              alignItems:
                'center'
            }}
          >
            <h1
              className={styles.title}
            >
              {product.pName}
            </h1>

            <div
              className={
                styles.wishlistContainer
              }
            >
              <button
                className={
                  styles.wishlistBtn
                }
                onClick={addToWishlist}
                disabled={
                  wishlistLoading
                }
                onMouseEnter={() =>
                  setHoveredHeart(true)
                }
                onMouseLeave={() =>
                  setHoveredHeart(false)
                }
              >
                <Heart
                  size={18}
                  fill={
                    isWishlisted ||
                      hoveredHeart
                      ? '#e69100'
                      : 'none'
                  }
                  color={
                    isWishlisted ||
                      hoveredHeart
                      ? '#e69100'
                      : 'black'
                  }
                />
              </button>
            </div>
          </div>

          {/* REVIEWS */}
          <div
            className={
              styles.reviews
            }
            onClick={() =>
              setIsReviewOpen(true)
            }
            style={{
              cursor: 'pointer'
            }}
          >
            <div
              className={
                styles.stars
              }
            >
              {stars.map(
                (star) => (
                  <Star
                    key={star}
                    size={16}
                    fill={
                      star <= avgRating
                        ? 'var(--accent-secondary)'
                        : 'none'
                    }
                    color={
                      star <= avgRating
                        ? 'var(--accent-secondary)'
                        : 'var(--text-muted)'
                    }
                  />
                )
              )}
            </div>

            <span
              className={
                styles.reviewCount
              }
            >
              ({reviews.length}{' '}
              Reviews)
            </span>
          </div>

          <div className={styles.price}>
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

          <p
            className={
              styles.description
            }
          >
            {product.pDescription}
          </p>

          {variants.length > 0 && (
            <div
              className={
                styles.colorSelection
              }
            >
              <h4>
                Colors:{' '}
              </h4>

              <div
                className={
                  styles.variantOptions
                }
              >
                {variants.map(
                  (
                    v,
                    idx
                  ) => (
                    <button
                      key={idx}
                      className={`${styles.colorSwatch} ${activeVariant ===
                          idx
                          ? styles.activeSwatch
                          : ''
                        }`}
                      style={{
                        backgroundColor:
                          v.pColor.toLowerCase()
                      }}
                      onClick={() =>
                        setActiveVariant(
                          idx
                        )
                      }
                    />
                  )
                )}
              </div>
            </div>
          )}

          <div
            className={
              styles.stockStatus
            }
          >
            <strong>{stock}</strong>{' '}
            items left in this color
          </div>

          <div
            className={
              styles.ctaGroup
            }
          >
            <button
              className="btn-primary flex-center gap-2"
              style={{ flex: 1 }}
              disabled={
                stock <= 0
              }
              onClick={addtocart}
            >
              <ShoppingBag size={20} />
              {stock <= 0
                ? 'Out of Stock'
                : 'Add to Cart'}
            </button>

            <button
            className="btn-secondary flex-center gap-2"
            style={{
              flex: 1,
              opacity: hasAR ? 1 : 0.5,
              cursor: hasAR ? "pointer" : "not-allowed"
            }}
            onClick={hasAR ? openAR : undefined}
            disabled={!hasAR}
          >
            <View size={20} />
            {hasAR ? "Preview in AR" : "Coming Soon"}
          </button>
          </div>

          <div
            className={`${styles.features} glass-panel`}
          >
            <h4>
              Product Details
            </h4>

            <ul>
              <li>
                Brand:{' '}
                {product.pBrand}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() =>
          setIsReviewOpen(false)
        }
        product={product}
      />

      {showPopup && (
        <div
          className={
            styles.popupOverlay
          }
        >
          <div
            className={
              styles.popupCard
            }
          >
            <h3
              className={
                styles.popupTitle
              }
            >
              {popupTitle}
            </h3>

            <p
              className={
                styles.popupText
              }
            >
              {popupMessage}
            </p>

            {popupMode === 'ok' && (
              <div
                className={
                  styles.popupActionsSingle
                }
              >
                <button
                  className={
                    styles.okBtn
                  }
                  onClick={() =>
                    setShowPopup(false)
                  }
                >
                  OK
                </button>
              </div>
            )}

            {popupMode ===
              'login' && (
                <div
                  className={
                    styles.popupActions
                  }
                >
                  <button
                    className={
                      styles.confirmBtn
                    }
                    onClick={() =>
                      navigate(
                        '/login'
                      )
                    }
                  >
                    Log In
                  </button>

                  <button
                    className={
                      styles.cancelBtn
                    }
                    onClick={() =>
                      setShowPopup(false)
                    }
                  >
                    Cancel
                  </button>
                </div>
              )}

            {popupMode ===
              'remove' && (
                <div
                  className={
                    styles.popupActions
                  }
                >
                  <button
                    className={
                      styles.confirmBtn
                    }
                    onClick={
                      removeWishlist
                    }
                  >
                    Remove
                  </button>

                  <button
                    className={
                      styles.cancelBtn
                    }
                    onClick={() =>
                      setShowPopup(false)
                    }
                  >
                    Cancel
                  </button>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;