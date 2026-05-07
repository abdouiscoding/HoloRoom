import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, X, Edit, Trash2, GripVertical } from "lucide-react";
import styles from "./DashboardViews.module.css";
import { API, address, myFetch } from "../../../api";

const FeaturedManagerView = () => {
  const token = localStorage.getItem("token");

  const [lists, setLists] = useState([]);
  const [products, setProducts] = useState([]);

  const [selectedList, setSelectedList] = useState(null);
  const [confirmPopup, setConfirmPopup] = useState(null);
  const [infoPopup, setInfoPopup] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [createModal, setCreateModal] = useState(false);
  const [listName, setListName] = useState("");

  // Tracks the currently dragged item
  const [dragging, setDragging] = useState(null);

  // ---------------- POPUPS ----------------
  const showInfo = (msg) => setInfoPopup(msg);

  const askConfirm = (message, onConfirm) => {
    setConfirmPopup({ message, onConfirm });
  };

  // ---------------- FETCH ----------------
  const fetchLists = async () => {
    const res = await myFetch(`${API}/api/featured/lists`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
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

  // ---------------- CREATE LIST ----------------
  const createList = async (e) => {
    e.preventDefault();
    if (!listName.trim()) return;

    await myFetch(`${API}/api/featured/lists`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    showInfo("Featured list created");
    setCreateModal(false);
    setListName("");
    fetchLists();
  };

  // ---------------- ADD ITEM ----------------
  const addItem = async (listId, productId, order) => {
    await myFetch(
      `${API}/api/featured/list/${listId}/add?productId=${productId}&order=${order}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    showInfo("Product added");
    fetchLists();
  };

  // ---------------- DELETE ITEM ----------------
  const removeItem = (listId, itemId) => {
    askConfirm("Remove this item?", async () => {
      await myFetch(`${API}/api/featured/list/${listId}/item/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      showInfo("Item removed");
      fetchLists();
    });
  };

  const deleteList = (listId) => {
    askConfirm("Delete this list?", async () => {
      await myFetch(`${API}/api/featured/list/${listId}/clear`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      showInfo("List deleted");
      fetchLists();
    });
  };

  // ---------------- DRAG AND DROP HANDLERS ----------------
  const handleDragStart = (e, listIndex, itemIndex) => {
    // Required for Firefox drag support
    e.dataTransfer.setData("text/plain", "");
    setDragging({ listIndex, itemIndex });
  };

  const handleDragEnter = (e, listIndex, targetIndex) => {
  if (!dragging || dragging.listIndex !== listIndex || dragging.itemIndex === targetIndex) {
    return;
  }

  const updated = [...lists];
  const items = [...updated[listIndex].items];

  const draggedItem = items.splice(dragging.itemIndex, 1)[0];
  items.splice(targetIndex, 0, draggedItem);

  const reordered = items.map((it, index) => ({
    ...it,
    order: index,
    displayOrder: index // if you're using this too
  }));

  updated[listIndex].items = reordered;

  setLists(updated);
  setDragging({ listIndex, itemIndex: targetIndex });
};

 const handleDragEnd = async (listIndex) => {
  if (!dragging) return;

  const updatedList = lists[listIndex];

  try {
    await Promise.all(
      updatedList.items.map((it, index) =>
        myFetch(
          `${API}/api/featured/list/${updatedList.id}/item/${it.id}/order?newOrder=${index}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
      )
    );

  } catch (err) {
    console.error(err);
    showInfo("Failed to update order");
  }

  setDragging(null);
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
      {lists.map((list, listIndex) => (
        <div key={list.id} className={styles.sectionHeader}>

          <div className={styles.listHeaderRow}>
            <h3>{list.name}</h3>

            <div className={styles.listActions}>
              <button
                className={styles.primaryBtn}
                onClick={() => setSelectedList(list)}
              >
                <Plus size={16} /> Add Item
              </button>

              <button
                className={styles.deleteBtnSmall}
                onClick={() => deleteList(list.id)}
              >
                <Trash2 size={16} />Clear
              </button>
            </div>
          </div>

          {/* ITEMS TABLE */}
          <div className={styles.tableWrapper}>
            {list.items?.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                draggable
                onDragStart={(e) => handleDragStart(e, listIndex, i)}
                onDragEnter={(e) => handleDragEnter(e, listIndex, i)}
                onDragOver={(e) => e.preventDefault()} // Required to allow dropping
                onDragEnd={() => handleDragEnd(listIndex)}
                className={styles.dragRow}
              >
                <div className={styles.dragHandle}>
                  <GripVertical size={16} />
                </div>

                <span>
                  Order: {' ' + item.displayOrder}
                </span>

                <span
                  className={styles.productLink}
                  onClick={() => setSelectedProduct(item.product)}
                >
                  {item.product.pName}
                </span>

                <span>{item.order}</span>

                <button
                  className={styles.actionBtnDelete}
                  onClick={() => removeItem(list.id, item.id)}
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      ))}

      {/* CREATE MODAL */}
      {createModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Create Featured List</h3>
              <button onClick={() => setCreateModal(false)}>
                <X />
              </button>
            </div>
            <form onSubmit={createList} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>List Name</label>
                <input
                  type="text"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  required
                />
              </div>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => setCreateModal(false)}
                >
                  Cancel
                </button>
                <button className={styles.primaryBtn}>
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD ITEM MODAL */}
      {selectedList && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Add Product</h3>
              <button onClick={() => setSelectedList(null)}>
                <X />
              </button>
            </div>
            <div className={styles.listBox}>
              {products.map((p) => (
                <div key={p.pId} className={styles.catRow}>
                  <span>{p.pName}</span>
                  <button
                    className={styles.primaryBtn}
                    onClick={() =>
                      addItem(
                        selectedList.id,
                        p.pId,
                        selectedList.items?.length || 0
                      )
                    }
                  >
                    Add
                  </button>
                </div>
              ))}
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