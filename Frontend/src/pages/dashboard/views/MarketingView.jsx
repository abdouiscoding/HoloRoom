import React, { useEffect, useState } from 'react';
import { Percent, X, Trash2, Star } from 'lucide-react';
import DashboardTable from '../../../components/dashboard/common/DashboardTable';
import styles from './DashboardViews.module.css';
import { color, select } from 'three/tsl';
import { API, address } from "../../../api";

const PRODUCTS_API = `${API}/api/products/get`;

const MarketingView = () => {
  const token = localStorage.getItem("token");

  const [modalType, setModalType] = useState(null);
  const [campaignScope, setCampaignScope] = useState('sitewide');

  const [discounts, setDiscounts] = useState([]);
  const [products, setProducts] = useState([]);

  const [confirmPopup, setConfirmPopup] = useState(null);
  const [infoPopup, setInfoPopup] = useState(null);

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [filterType, setFilterType] = useState("all");

  // ================= POPUPS =================
  const showInfo = (msg) => setInfoPopup(msg);

  const askConfirm = (message, onConfirm) => {
    setConfirmPopup({ message, onConfirm });
  };

  // ================= FETCH =================
  const fetchDiscounts = async () => {
    const res = await fetch(`${API}/api/discounts`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setDiscounts(data);
  };

  const fetchProducts = async () => {
    const res = await fetch(`${API}/api/products/get`);
    const data = await res.json();
    setProducts(data);
  };

  useEffect(() => {
    fetchDiscounts();
    fetchProducts();
  }, []);

  // ================= CREATE =================

  const createDiscountRequest = async (body) => {
  try {
    const res = await fetch(`${API}/api/discounts/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) throw new Error(await res.text());

    showInfo("Discount created");
    setModalType(null);
    fetchDiscounts();

  } catch (err) {
    console.error(err);
    showInfo("Failed to create discount");
  }
};

  const createDiscount = async (e) => {
  e.preventDefault();

  const form = e.target;

  const body = {
    name: form.name.value,
    percentage: Number(form.percentage.value),
    active: true,
    productId:
      campaignScope === "specific"
        ? Number(form.productId.value)
        : null
  };

  if (body.productId) {
    const existing = discounts.find(
      d => d.productId === body.productId
    );

    if (existing) {
      return askConfirm(
        "This product already has a campaign. Replace it?",
        async () => {
          // delete old one
          await fetch(`${API}/api/discounts/${existing.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
          });

          // create new one
          await createDiscountRequest(body);
        }
      );
    }
  }

  await createDiscountRequest(body);
};
  // ================= DELETE =================
  const deleteDiscount = (id) => {
    askConfirm("Delete this discount?", async () => {
      await fetch(`${API}/api/discounts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      showInfo("Deleted successfully");
      fetchDiscounts();
    });
  };

  // ================= TABLE =================
  const columns = [
    {
      header: "Name",
      render: (d) => (
        <span>{d.name || "Discount"}</span>
      )
    },
    {
      header: "Type",
      render: (d) => d.productId ? "Product" : "Sitewide"
    },
    {
      header: "Target",
      render: (d) => {
  if (!d.productId) return "All Products";

  const product = products.find(p => p.pId === d.productId);

  if (!product) return "Product";

  return (
    <span
      style={{ cursor: "pointer" }}
      className={styles.productLink}
      onClick={() => setSelectedProduct(product)}
    >
      {product.pName}
    </span>
  );
}
    },
    {
      header: "Discount",
      render: (d) => `${d.percentage}%`
    },
    {
      header: "Actions",
      render: (d) => (
        <button
          className={styles.actionBtnDelete}
          onClick={() => deleteDiscount(d.id)}
        >
          <Trash2 size={16} />
        </button>
      )
    }
  ];

  const filteredDiscounts = discounts.filter(d => {
  if (filterType === "site") return !d.productId;
  if (filterType === "product") return d.productId;
  return true;
});

  return (
    <div className={styles.viewContainer}>

      {/* HEADER */}
      <div className={styles.viewHeaderWithAction}>
        <div>
          <h2>Discount Campaigns</h2>
          <p>Manage discounts and site-wide sales.</p>
        </div>

        <button
          className={styles.primaryBtn}
          onClick={() => setModalType('campaign')}
        >
          <Percent size={18} /> Create Campaign
        </button>
        
      </div>

      <div>
        Filter by:
      </div>

      <div style={{ display: "flex", gap: "5px", marginBottom: "10px" }}>
  <button
    className={styles.secondaryBtn}
    onClick={() => setFilterType("all")}
  >
    All
  </button>

  <button
    className={styles.secondaryBtn}
    onClick={() => setFilterType("site")}
  >
    Sitewide
  </button>

  <button
    className={styles.secondaryBtn}
    onClick={() => setFilterType("product")}
  >
    Product
  </button>
</div>

      {/* TABLE */}
      <div className={styles.sectionHeader}>
        <h3>Active Campaigns</h3>
      </div>

      <DashboardTable
        columns={columns}
        data={filteredDiscounts}
        emptyStateMessage="No active discount campaigns."
      />

      {/* MODAL */}
      {modalType && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>

            <div className={styles.modalHeader}>
              <h3>Create Discount</h3>
              <button onClick={() => setModalType(null)} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <form className={styles.modalForm} onSubmit={createDiscount}>

              <div className={styles.formGroup}>
                <label>Name</label>
                <input name="name" type="text" required />
              </div>

              <div className={styles.formGroup}>
                <label>Percentage</label>
                <input name="percentage" type="number" required />
              </div>

              <div className={styles.formGroup}>
                <label>Scope</label>
                <select
                  value={campaignScope}
                  onChange={(e) => setCampaignScope(e.target.value)}
                >
                  <option value="sitewide">Site-wide</option>
                  <option value="specific">Specific Product</option>
                </select>
              </div>

              {campaignScope === "specific" && (
                <div className={styles.formGroup}>
                  <label>Product</label>
                  <select name="productId" required>
                    <option value="">Select product</option>
                    {products.map((p, i) => (
                      <option
                        key={p.pId ?? p.productId ?? i}
                        value={p.pId ?? p.productId}
                      >
                        {p.pName || p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => setModalType(null)}
                >
                  Cancel
                </button>

                <button className={styles.primaryBtn}>
                  Save
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {selectedProduct && (
  <div
    className={styles.modalOverlay}
    onClick={() => setSelectedProduct(null)}
  >
    <div
      className={styles.productModal}
      onClick={(e) => e.stopPropagation()}
    >

      {/* HEADER */}
      <div className={styles.modalHeader}>
        <h3 className={styles.productTitle}>{selectedProduct.pName}</h3>

        <button
          className={styles.closeBtn}
          onClick={() => setSelectedProduct(null)}
        >
          <X size={20} />
        </button>
      </div>

      {/* IMAGE SLIDER */}
      <div className={styles.sliderWrapper}>

        <button className={styles.secondaryBtn + " " + styles.sliderBtn}>
          {"<"}
        </button>

        <div className={styles.slider}>
          {(selectedProduct.images || []).map((img, i) => (
            <img
              key={i}
              src={img.pImageUrl}
              className={styles.sliderImg}
            />
          ))}
        </div>

        <button className={styles.secondaryBtn + " " + styles.sliderBtn}>
          {">"}
        </button>

      </div>

      {/* INFO */}
      <div className={styles.productInfo}>

              <div className={styles.infoRow}>
                <span>Brand</span>
                <span>{selectedProduct.pBrand}</span>
              </div>

              <div className={styles.infoRow}>
                <span>Price</span>
                <span>{selectedProduct.pPrice}</span>
              </div>

              <div className={styles.infoRow}>
                <span>Discount</span>
                <span>{(selectedProduct.pDiscount)}%</span>
              </div>

              <div className={styles.infoRow}>
                <span>Final Price</span>
                <span>{selectedProduct.pFinalPrice}</span>
              </div>

              <div className={styles.infoRow}>
                <span>Sold</span>
                <span>{selectedProduct.pSold}</span>
              </div>

              <div className={styles.infoRow}>
                <span>Wishlist</span>
                <span>{selectedProduct.pWishes}</span>
              </div>

              <div className={styles.infoRow}>
                <span>Rating</span>

                <span className={styles.ratingRow}>
                  {selectedProduct.pRating
                    ? selectedProduct.pRating
                    : "Unrated"}

                  <span className={styles.star}>★</span>
                </span>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* CONFIRM */}
      {confirmPopup && (
        <div className={styles.modalOverlay}>
          <div className={styles.popupCard}>
            <h3>{confirmPopup.message}</h3>

            <div className={styles.omodalActions}>
              <button onClick={() => setConfirmPopup(null)} className={styles.secondaryBtn}>
                Cancel
              </button>

              <button
                className={styles.primaryBtn}
                onClick={() => {
                  confirmPopup.onConfirm();
                  setConfirmPopup(null);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INFO */}
      {infoPopup && (
        <div className={styles.modalOverlay} onClick={() => setInfoPopup(null)}>
          <div className={styles.popupCard}>
            <h3>{infoPopup}</h3>

            <div className={styles.omodalActions}>
              <button className={styles.primaryBtn} onClick={() => setInfoPopup(null)}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MarketingView;