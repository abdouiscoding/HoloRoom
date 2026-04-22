import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { View, ShoppingBag, ArrowLeft, Star, Heart, Share2, Check } from 'lucide-react';
import styles from './ProductDetail.module.css';
import { useWishlist } from '../context/WishlistContext';
import { useReviews } from '../context/ReviewsContext';
import ReviewModal from '../components/product/ReviewModal';

const ProductDetail = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { getReviews } = useReviews();
  
  const [activeImage, setActiveImage] = useState(0);
  const [activeVariant, setActiveVariant] = useState(0);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:8080/api/products/get/${localStorage.getItem("selectedProductId")}`,
          {
            headers: { "Authorization": token ? `Bearer ${token}` : "" }
          }
        );

        if (response.ok) {
          const data = await response.json();
          setProduct(data);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
  }, [id]);

  if (loading) return <div className="container" style={{padding: '5rem', textAlign: 'center'}}><h2>Loading...</h2></div>;
  if (!product) return <div className="container" style={{padding: '5rem', textAlign: 'center'}}><h2>Product not found.</h2></div>;

  // --- DATA PROCESSING ---

  // 1. Filter out duplicate colors if the backend is sending double values
  const rawVariants = product.sizecolorstock || [];
  const variants = rawVariants.filter((v, index, self) =>
    index === self.findIndex((t) => t.pColor === v.pColor)
  );

  const images = (product.images && product.images.length > 0)
    ? product.images.map(img => img.pImageUrl) 
    : ["https://via.placeholder.com/800"];

  const categoryName = product.categories?.pCategory || "General";
  const reviews = getReviews(product.pId) || [];
  const avgRating = parseFloat(product.pRating) || 0; 
  const starTemplate =[];

  const addtocart = async () => {
    if (!product || !variants[activeVariant]) {
      alert("Please select a color first");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      
      const cartRes = await fetch(`http://localhost:8080/api/cart/getbyuserid/${userId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const cartData = await cartRes.json();

      const requestBody = {
        pId: product.pId.toString(),
        pscsId: variants[activeVariant].pscsId.toString(),
        pImageId: product.images[activeImage].pImageId.toString(),
        quantity: "1"
      };

      const addResponse = await fetch(`http://localhost:8080/api/cart/additem/${cartData.cartId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (addResponse.ok) alert("Added to cart!");
    } catch (error) {
      console.error("Cart error:", error);
    }
  };

  return (
    <div className={`container ${styles.productContainer}`}>
      <button onClick={() => navigate(-1)} className={styles.backBtn}>
        <ArrowLeft size={18} /> Back to Shop
      </button>

      <div className={styles.productGrid}>
        <div className={styles.gallery}>
          <div className={styles.mainImageWrapper}>
            <img src={images[activeImage]} alt={product.pName} className={styles.mainImage} />
          </div>
          <div className={styles.thumbnailList}>
            {images.map((img, idx) => (
              <button 
                key={idx} 
                className={`${styles.thumbnailWrapper} ${activeImage === idx ? styles.activeThumb : ''}`}
                onClick={() => setActiveImage(idx)}
              >
                <img src={img} alt="thumb" />
              </button>
            ))}
          </div>
        </div>

        <div className={styles.info}>
          <div className={styles.headerRow}>
            <span className={styles.category}>{categoryName}</span>
          </div>
          
          <h1 className={styles.title}>{product.pName}</h1>
          
          <div className={styles.reviews}>
            <div className={styles.stars}>
              {starTemplate.map((star) => (
                <Star 
                  key={star} 
                  size={16} 
                  fill={star <= avgRating ? "var(--accent-secondary)" : "none"} 
                  color={star <= avgRating ? "var(--accent-secondary)" : "var(--text-muted)"} 
                />
              ))}
            </div>
            <span>({reviews.length} Reviews)</span>
          </div>

          <div className={styles.price}>{product.pPrice} DZD</div>
          <p className={styles.description}>{product.pDescription}</p>

          {/* COLOR CIRCLES FIX */}
          {variants.length > 0 && (
            <div className={styles.colorSelection}>
              <h4>Color: <span style={{color: 'var(--text-secondary)'}}>{variants[activeVariant]?.pColor}</span></h4>
              <div className={styles.variantOptions}>
                {variants.map((v, idx) => (
                  <button 
                    key={idx} 
                    className={`${styles.colorSwatch} ${activeVariant === idx ? styles.activeSwatch : ''}`}
                    style={{ backgroundColor: v.pColor.toLowerCase() }} 
                    onClick={() => setActiveVariant(idx)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className={styles.stockStatus} style={{marginTop: '10px'}}>
             <strong>{variants[activeVariant]?.productStock || 0}</strong> items left in this color
          </div>

          <div className={styles.ctaGroup}>
            <button 
              className="btn-primary flex-center gap-2" 
              style={{flex: 1}}
              disabled={variants[activeVariant]?.productStock <= 0}
              onClick={addtocart}
            >
              <ShoppingBag size={20} /> 
              {variants[activeVariant]?.productStock <= 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button className="btn-secondary flex-center gap-2" style={{flex: 1}} onClick={() => navigate(`/ar/${id}`)}>
              <View size={20} /> Preview in AR
            </button>
          </div>

          <div className={`${styles.features} glass-panel`}>
            <h4>Product Details</h4>
            <ul>
                <li><Check size={16} className={styles.checkIcon} /> Brand: {product.pBrand}</li>
                <li><Check size={16} className={styles.checkIcon} /> Status: {product.pStatus}</li>
            </ul>
          </div>
        </div>
      </div>

      <ReviewModal 
        isOpen={isReviewOpen} 
        onClose={() => setIsReviewOpen(false)} 
        product={product} 
      />
    </div>
  );
};

export default ProductDetail;