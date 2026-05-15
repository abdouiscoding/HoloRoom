import React, { useEffect, useState } from "react";
import { X, Trash2, Edit } from "lucide-react";
import styles from "./DashboardViews.module.css";
import { API, myFetch } from "../../../api";

const ROOM_SPOTS = {
  living_room: [
    { key: "sofa_main", label: "3-seat sofa, center piece" },
    { key: "coffee_table", label: "Coffee table" },
    { key: "floor_lamp", label: "Tall floor lamp" },
    { key: "accent_chair", label: "Single armchair" },
    { key: "tv_stand", label: "TV cabinet / media console" },
    { key: "side_table", label: "Small side table" },
    { key: "plant_decor", label: "Floor plant in pot" },
  ],
  bedroom: [
    { key: "bed_main", label: "Queen/king bed" },
    { key: "nightstand_left", label: "Nightstand" },
    { key: "nightstand_right", label: "Nightstand" },
    { key: "bedside_lamp", label: "Small table lamp (sits on the nightstand)" },
    { key: "wardrobe", label: "Wardrobe / armoire" },
    { key: "chair_accent", label: "Bedroom accent chair" },
  ],
  kitchen: [
    { key: "dining_table", label: "Dining table" },
    { key: "dining_chair_1", label: "Dining chair" },
    { key: "dining_chair_2", label: "Dining chair" },
    { key: "bar_stool", label: "Bar stool" },
    { key: "cabinet", label: "Kitchen cabinet / sideboard" },
    { key: "pendant_light", label: "Pendant ceiling light" },
  ],
  office: [
    { key: "desk_main", label: "Office desk" },
    { key: "office_chair", label: "Office chair" },
    { key: "desk_lamp", label: "Small desk lamp (sits on the desk)" },
    { key: "bookshelf", label: "Tall bookshelf" },
    { key: "monitor", label: "Monitor (sits on the desk)" },
    { key: "floor_plant", label: "Floor plant" },
  ],
};

const FeaturedManagerView = () => {
  const token = localStorage.getItem("token");

  const [lists, setLists] = useState([]);
  const [products, setProducts] = useState([]);

  const [selectedList, setSelectedList] = useState(null);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [confirmPopup, setConfirmPopup] = useState(null);
  const [infoPopup, setInfoPopup] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // ---------------- POPUPS ----------------
  const showInfo = (msg) => setInfoPopup(msg);

  const askConfirm = (message, onConfirm) => {
    setConfirmPopup({ message, onConfirm });
  };

  const ROOM_KEYS = ["living_room", "bedroom", "kitchen", "office"];
  const getRoomSpots = (list) => ROOM_SPOTS[list?.name] || [];
  const getRoomList = (name) => lists.find((list) => list.name === name) || { id: null, name, items: [] };
  const roomLists = ROOM_KEYS.map((name) => getRoomList(name));

  // ---------------- FETCH ----------------
  const fetchLists = async () => {
    const res = await myFetch(`${API}/api/featured/lists`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    const missingRooms = ROOM_KEYS.filter(
      (name) => !data.some((list) => list.name === name)
    );

    if (missingRooms.length) {
      await Promise.all(
        missingRooms.map((name) =>
          myFetch(
            `${API}/api/featured/list/create?name=${encodeURIComponent(name)}`,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
            }
          )
        )
      );
      const nextRes = await myFetch(`${API}/api/featured/lists`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const nextData = await nextRes.json();
      setLists(nextData);
      return;
    }

    setLists(data);
  };

  const fetchProducts = async () => {
    const res = await myFetch(`${API}/api/products/get`);
    const data = await res.json();
    setProducts(data);
  };

  useEffect(() => {
    fetchLists();
    fetchProducts();
  }, []);

  // ---------------- ADD ITEM / EDIT ITEM ----------------
  const addItem = async (listName, productId, spot) => {
    if (!spot) return;

    await myFetch(
      `${API}/api/featured/list/${listName}/spot?productId=${productId}&spot=${encodeURIComponent(spot)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    showInfo("Product assigned to spot");
    fetchLists();
  };

  // ---------------- DELETE ITEM ----------------
  const removeItem = (listName, itemId) => {
    askConfirm("Remove this item?", async () => {
      await myFetch(`${API}/api/featured/list/${listName}/item/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      showInfo("Item removed");
      fetchLists();
    });
  };

  // ---------------- UI ----------------
  return (
    <div className={styles.viewContainer}>

      {/* HEADER */}
      <div className={styles.viewHeaderWithAction}>
        <div>
          <h2>Featured Products List</h2>
          <p>Manage homepage featured sections</p>
        </div>
      </div>

      {/* LISTS */}
      {roomLists.map((list) => (
        <div key={list.name} className={styles.sectionHeader}>

          <div className={styles.listHeaderRow}>
            <h3>{list.name.replace(/_/g, " ")}</h3>
          </div>

          <div className={styles.tableWrapper}>
            {getRoomSpots(list).map((spot) => {
              const item = list.items?.find((it) => it.spot === spot.key);
              return (
                <div key={spot.key} className={styles.catRow}>
                  <div>
                    <div><strong>{spot.key}</strong></div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                      {spot.label}
                    </div>
                  </div>
                  <div>
                    {item?.product ? (
                      <span
                        className={styles.productLink}
                        onClick={() => setSelectedProduct(item.product)}
                      >
                        {item.product.pName}
                      </span>
                    ) : (
                      <span className={styles.mutedText}>No product assigned</span>
                    )}
                  </div>
                  <div className={styles.actionButtons}>
                    <button
                      className={styles.actionBtnEdit}
                      onClick={() => {
                        setSelectedList(list);
                        setSelectedSpot(spot.key);
                      }}
                    >
                      <Edit size={16} />
                    </button>
                    {item?.product && (
                      <button
                        className={styles.actionBtnDelete}
                        onClick={() => removeItem(list.name, item.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}


      {/* ADD ITEM MODAL */}
      {selectedList && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Assign Product to {selectedList.name.replace(/_/g, " ")}</h3>
              <button
                onClick={() => {
                  setSelectedList(null);
                  setSelectedSpot(null);
                }}
              >
                <X />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Room Spot</label>
                <select
                  value={selectedSpot || ""}
                  onChange={(e) => setSelectedSpot(e.target.value)}
                >
                  {getRoomSpots(selectedList).map((spot) => (
                    <option key={spot.key} value={spot.key}>
                      {spot.key} — {spot.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.listBox}>
                {products.map((p) => (
                  <div key={p.pId} className={styles.catRow}>
                    <span>{p.pName}</span>
                    <button
                      className={styles.primaryBtn}
                      onClick={() => addItem(selectedList.name, p.pId, selectedSpot)}
                    >
                      Assign
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT INFO MODAL */}
      {selectedProduct && (
        <div className={styles.modalOverlay} onClick={() => setSelectedProduct(null)}>
          <div className={styles.productModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{selectedProduct.pName}</h3>
              <button onClick={() => setSelectedProduct(null)}>
                <X />
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
                    alt="product"
                  />
                ))}
              </div>
              <button className={styles.secondaryBtn + " " + styles.sliderBtn}>
                {">"}
              </button>
            </div>

            <div className={styles.productInfo}>
              <div className={styles.infoRow}>
                <span>Brand</span>
                <span>{selectedProduct.pBrand}</span>
              </div>
              <div className={styles.infoRow}>
                <span>Price</span>
                <span>{selectedProduct.pPrice} DZD</span>
              </div>
              <div className={styles.infoRow}>
                <span>Discount</span>
                <span>{selectedProduct.pDiscount}%</span>
              </div>
              <div className={styles.infoRow}>
                <span>Final</span>
                <span>{selectedProduct.pFinalPrice} DZD</span>
              </div>
              <div className={styles.infoRow}>
                <span>Sold</span>
                <span>{selectedProduct.pSold}</span>
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

export default FeaturedManagerView;