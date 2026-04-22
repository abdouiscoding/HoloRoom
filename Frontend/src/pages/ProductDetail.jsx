import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { View, ShoppingBag, ArrowLeft, Star, Heart, Share2, Check } from 'lucide-react';
import styles from './ProductDetail.module.css';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useReviews } from '../context/ReviewsContext';
import ReviewModal from '../components/product/ReviewModal';

const MOCK_PRODUCT = {
  id: 1, 
  name: 'Velvet Accent Chair', 
  price: '29900 DZD', 
  images: [
    'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1567538096621-789a80373ab9?auto=format&fit=crop&q=80&w=800'
  ],
  category: 'Furniture',
  description: 'Add a touch of elegant mid-century modern style to your space. This velvet accent chair features soft, plush upholstery and a sleek angled frame for superior comfort and distinct aesthetic appeal. Try it in your room using our AR tool.',
  colors: ['#2E3A4B', '#9D4B55', '#E6C687'],
  features: [
    'Premium stain-resistant velvet',
    'High-density foam cushioning',
    'Solid ash wood legs',
    'Easy 5-minute assembly'
  ]
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { getReviews, getAverageRating } = useReviews();
  const [activeImage, setActiveImage] = useState(0);
  const [activeColor, setActiveColor] = useState(0);
  const [activeStock, setActiveStock] = useState(0);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const reviews = getReviews(MOCK_PRODUCT.id);
  const avgRating = parseFloat(getAverageRating(MOCK_PRODUCT.id));
  const displayStars = isNaN(avgRating) || avgRating === 0 ? 0 : avgRating;

  return (
    <div className={`container ${styles.productContainer}`}>
      <button onClick={() => navigate(-1)} className={styles.backBtn}>
        <ArrowLeft size={18} /> Back to Shop
      </button>

      <div className={styles.productGrid}>
        {/* Gallery */}
        <div className={styles.gallery}>
          <div className={styles.mainImageWrapper}>
            <img src={MOCK_PRODUCT.images[activeImage]} alt={MOCK_PRODUCT.name} className={styles.mainImage} />
            <button className={`${styles.arOverlayBtn} btn-primary`} onClick={() => navigate(`/ar/${id}`)}>
              <View size={20} /> View in Your Room
            </button>
          </div>
          <div className={styles.thumbnailList}>
            {MOCK_PRODUCT.images.map((img, idx) => (
              <button 
                key={idx} 
                className={`${styles.thumbnailWrapper} ${activeImage === idx ? styles.activeThumb : ''}`}
                onClick={() => setActiveImage(idx)}
              >
                <img src={img} alt={`Thumbnail ${idx}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className={styles.info}>
          <div className={styles.headerRow}>
            <span className={styles.category}>{MOCK_PRODUCT.category}</span>
            <div className={styles.actions}>
              <button className={styles.iconBtn} onClick={() => toggleWishlist(MOCK_PRODUCT)}>
                <Heart size={20} fill={isInWishlist(MOCK_PRODUCT.id) ? "var(--accent-primary)" : "none"} color={isInWishlist(MOCK_PRODUCT.id) ? "var(--accent-primary)" : "var(--text-primary)"} />
              </button>
              <button className={styles.iconBtn}><Share2 size={20}/></button>
            </div>
          </div>
          
          <h1 className={styles.title}>{MOCK_PRODUCT.name}</h1>
          
          <div className={styles.reviews}>
            <div className={styles.stars}>
              {[1, 2, 3, 4, 5].map(star => (
                <Star 
                  key={star} 
                  size={16} 
                  fill={star <= displayStars ? "var(--accent-secondary)" : "none"} 
                  color={star <= displayStars ? "var(--accent-secondary)" : "var(--text-muted)"} 
                />
              ))}
            </div>
            <span style={{cursor: 'pointer', textDecoration: 'underline'}} onClick={() => setIsReviewOpen(true)}>
              ({reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'})
            </span>
          </div>

          <div className={styles.price}>{MOCK_PRODUCT.price}</div>
          
          <p className={styles.description}>{MOCK_PRODUCT.description}</p>

          <div className={styles.colorSelection}>
            <h4>Available Colors</h4>
            <div className={styles.colorOptions}>
              {MOCK_PRODUCT.colors.map((color, idx) => (
                <button 
                  key={idx} 
                  className={`${styles.colorSwatch} ${activeColor === idx ? styles.activeSwatch : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setActiveColor(idx)}
                />
              ))}
            </div>
          </div>

          <div className={styles.ctaGroup}>
            <button 
              className="btn-primary flex-center gap-2" 
              style={{flex: 1}}
              onClick={() => addToCart(MOCK_PRODUCT, 1, MOCK_PRODUCT.colors[activeColor])}
            >
              <ShoppingBag size={20} /> Add to Cart
            </button>
            <button className="btn-secondary flex-center gap-2" style={{flex: 1}} onClick={() => navigate(`/ar/${id}`)}>
              <View size={20} /> Preview in AR
            </button>
          </div>

          <div className={`${styles.features} glass-panel`}>
            <h4>Product Highlights</h4>
            <ul>
              {MOCK_PRODUCT.features.map((feat, idx) => (
                <li key={idx}><Check size={16} className={styles.checkIcon} /> {feat}</li>
              ))}
            </ul>
          </div>

        </div>
      </div>
      <ReviewModal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} product={MOCK_PRODUCT} />
    </div>
  );
};

export default ProductDetail;
