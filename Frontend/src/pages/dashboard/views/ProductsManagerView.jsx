import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import styles from './DashboardViews.module.css';
import { API, address, myFetch } from "../../../api";

const ProductsManagerView = () => {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [confirmPopup, setConfirmPopup] = useState(null);
  const [infoPopup, setInfoPopup] = useState(null);
  const [allCategories, setAllCategories] = useState([]);
  const [catPopupOpen, setCatPopupOpen] = useState(false);
  const [catSearch, setCatSearch] = useState("");
  const [colorPicker, setColorPicker] = useState({
  open: false,
  index: null
  });

  const token = localStorage.getItem("token");
  // fetch categories
  const fetchCategories = async () => {
  const res = await myFetch(`${API}/api/categories/get`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  const data = await res.json();
  console.log("data");
  setAllCategories(data);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  //add category
  const AddCategoryBox = ({ setAllCategories }) => {
  const [name, setName] = useState("");

  const add = async () => {
    const res = await myFetch(`${API}/api/categories/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json",  
      Authorization: `Bearer ${token}` },
      body: JSON.stringify({ pCategory: name })
    });

    const data = await res.json();
    setAllCategories(prev => [...prev, data]);
    setName("");
  };

  return (
    <div className={styles.addBox}>
      <input
        placeholder="New category"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={add}>Add</button>
    </div>
  );
};

  const [pscs, setPscs] = useState([]);
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);

  //popups
  const askConfirm = (message, onConfirm) => {
  setConfirmPopup({ message, onConfirm });
  };

  const showInfo = (message) => {
  setInfoPopup(message);
  };

  // =========================
  // FETCH
  // =========================
  const fetchProducts = async () => {
    const res = await myFetch(`${API}/api/products/get`);
    const data = await res.json();
    setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // =========================
  // OPEN EDIT
  // =========================
  const openEdit = (p) => {
  setEditingProduct(p);

  setPscs(
    (p.sizecolorstock || []).map(v => ({
      size: v.pSize ?? "",
      color: v.pColor ?? "",
      stock: v.pStock ?? 0
    }))
  );

  setImages(p.images || []);
  setCategories(p.categories || []);

  setIsModalOpen(true);
  };

  // =========================
  // DELETE
  // =========================
  const deleteProduct = (id) => {
  askConfirm("Delete this product?", async () => {
    await myFetch(`${API}/api/products/delete/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    showInfo("Deleted successfully");
    fetchProducts();
  });
  };

    const deleteCategory = async (id) => {
  try {

    const res = await myFetch(`${API}/api/categories/delete/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });


    showInfo("Category deleted");
    fetchCategories();
  } catch (err) {
    showInfo("Error deleting category");
  }
};

  // =========================
  // ADD IMAGE INPUT
  // =========================
  const addImage = () => {
    setImages([...images, { file: null }]);
  };

  const removeImage = (i) => {
    setImages(images.filter((_, idx) => idx !== i));
  };

  // =========================
  // ADD PSCS
  // =========================
  const addPscs = () => {
    setPscs([...pscs, { size: "", color: "", stock: 0 }]);
  };

  const removePscs = (i) => {
    setPscs(pscs.filter((_, idx) => idx !== i));
  };

  // =========================
  // SAVE
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;

    const body = {
      pName: form.name.value,
      pPrice: form.price.value,
      pBrand: form.brand.value,
      pDescription: form.description.value,
      categories: categories,
      sizecolorstock: pscs.map(v => ({
      pSize: v.size,
      pColor: v.color,
      pStock: parseInt(v.stock) || 0
    }))
    };

    let productId;

    try {
      if (editingProduct) {

        const res = await myFetch(`${API}/api/products/update-full/${editingProduct.pId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(body)
        });

        const data = await res.json();
        productId = data.pId;
      } else {
        const res = await myFetch(`${API}/api/products/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(body)
        });

        const data = await res.json();
        productId = data.pId;
      }

      // upload images
      for (let img of images) {
        if (img.file) {
          const fd = new FormData();
          fd.append("file", img.file);

          const uploadRes = await myFetch(`${API}/api/products/upload-image/${productId}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: fd
          });

          if (!uploadRes.ok) {
            const errorText = await uploadRes.text();
            throw new Error(`Failed to upload image: ${errorText}`);
          }
        }
      }

      showInfo("Saved successfully");
      setIsModalOpen(false);
      setEditingProduct(null);

      // IMPORTANT → refresh to get correct image URLs
      fetchProducts();

    } catch (err) {
      showInfo("Error saving product");
    }
  };

  return (
    <div className={styles.viewContainer}>

      <div className={styles.viewHeaderWithAction}>
        <div>
        <h2>Products</h2>
        <p>Manage products, categories, and more.</p>
        </div>
        <button className={styles.primaryBtn} onClick={() => {
          setEditingProduct(null);
          setPscs([]);
          setImages([]);
          setCategories([]);
          setIsModalOpen(true);
        }}>
          <Plus size={18}/> Add Product
        </button>
      </div>

      {/* CONFIRM POPUP */}
      {confirmPopup && (
        <div className={styles.oomodalOverlay}>
          <div className={styles.popupCard}>
            <h3>{confirmPopup.message}</h3>

            <div className={styles.omodalActions}>
              <button
                className={styles.secondaryBtn}
                onClick={() => setConfirmPopup(null)}
              >
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

      {/* INFO POPUP */}
      {infoPopup && (
        <div
          className={styles.oomodalOverlay}
          onClick={() => setInfoPopup(null)}
        >
          <div
            className={styles.popupCard}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>{infoPopup}</h3>

            <div className={styles.omodalActions}>
              <button
                className={styles.primaryBtn}
                onClick={() => setInfoPopup(null)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= GRID ================= */}
      <div className={styles.productGrid}>
        {products.map(p => (
          <div key={p.pId} className={styles.productCard}>

            <img
              src={p.images?.[0]?.pImageUrl || "/placeholder.png"}
              className={styles.productImage}
            />

            <h4>{p.pName}</h4>

            <div className={styles.cardActions}>
              <button className={styles.actionBtnEdit} onClick={() => openEdit(p)}>
                <Edit size={16}/>
              </button>
              <button className={styles.actionBtnDelete} onClick={() => deleteProduct(p.pId)}>
                <Trash2 size={16}/>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CATEGORY POPUP */}
      {catPopupOpen && (
      <div className={styles.omodalOverlay} onClick={() => setCatPopupOpen(false)}>
        <div className={styles.popupCard} onClick={(e) => e.stopPropagation()}>

          <h3>Categories</h3>

          <input
            placeholder="Search..."
            value={catSearch}
            onChange={(e) => setCatSearch(e.target.value)}
          />

          <div className={styles.listBox}>
          {allCategories
            .filter(c =>
              c.pCategory.toLowerCase().includes(catSearch.toLowerCase())
            )
            .map((c) => {
              const selected = categories.some(x => x.pCategory === c.pCategory);

              return (
                <div
                  key={c.pcaId}
                  className={styles.catRow}
                >
                  <span>{c.pCategory}</span>

                  <input
                    type="checkbox"
                                      onClick={() => {
                    if (selected) {
                      setCategories(categories.filter(x => x.pCategory !== c.pCategory));
                    } else {
                      setCategories([...categories, c]);
                    }
                    }}
                    checked={selected}
                    readOnly
                    className={styles.catCheck}
                  />

                  <button className={styles.actionBtnDelete} 
                  onClick={() => askConfirm("Do you want to delete this category?",() => deleteCategory(c.pcaId))}>
                  <Trash2 size={16}/>
                  Delete</button>
                </div>
              );
            })}
        </div>

          {/* add category */}
          <AddCategoryBox setAllCategories={setAllCategories} />

          <button
            className={styles.primaryBtn}
            onClick={() => setCatPopupOpen(false)}
          >
            Done
          </button>

        </div>
      </div>
    )}

      {/* ================= MODAL ================= */}
      {isModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >

            <div className={styles.modalHeader}>
              <h3>{editingProduct ? "Edit Product" : "Add Product"}</h3>
              <button onClick={() => setIsModalOpen(false)} className={styles.closeBtn}>
                <X size={20}/>
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>

              <div className={styles.formGroup}>
                <label>Name</label>
                <input name="name" type="text" defaultValue={editingProduct?.pName}/>
              </div>

              <div className={styles.formGroup}>
                <label>Price</label>
                <input name="price" type="number" defaultValue={editingProduct?.pPrice}/>
              </div>

              <div className={styles.formGroup}>
                <label>Brand</label>
                <input name="brand" type="text" defaultValue={editingProduct?.pBrand}/>
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea name="description" defaultValue={editingProduct?.pDescription}/>
              </div>

              {/* ================= CATEGORIES ================= */}
              <div className={styles.formGroup}>
                <label>Categories</label>

                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => setCatPopupOpen(true)}
                >
                  Select Categories
                </button>

                <div className={styles.selectedTags}>
                  {categories.map((c, i) => (
                    <span key={i} className={styles.tag}>
                      {c.pCategory}
                      {i < categories.length - 1 && ", "}
                    </span>
                  ))}
                </div>
              </div>
              {/* ================= IMAGES ================= */}
              <div className={styles.formGroup}>
                <label>Images</label>

                {images.map((img, i) => (
                  <div key={i} className={styles.listRow}>

                    {img.pImageUrl ? (
                      <>
                      <img src={img.pImageUrl} 
                      className={styles.previewImg} 
                      />

                        <button
                          type="button"
                          className={styles.removeBtn}
                          onClick={() => removeImage(i)}
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <>
                        <input
                          type="file"
                          onChange={(e) => {
                            const copy = [...images];
                            copy[i].file = e.target.files[0];
                            setImages(copy);
                          }}
                        />

                        <button
                          type="button"
                          className={styles.removeBtn}
                          onClick={() => removeImage(i)}
                        >
                          Remove
                        </button>
                      </>
                    )}

                  </div>
                ))}

                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={addImage}
                >
                  + Add Image
                </button>
              </div>

              {/* ================= PSCS ================= */}
              <div className={styles.formGroup}>
                <label>Variants</label>

                {pscs.map((v, i) => (
                  <div key={i} className={styles.pscsRow}>

                    <select
                      value={v.size}
                      onChange={(e) => {
                        const copy = [...pscs];
                        copy[i].size = e.target.value;
                        setPscs(copy);
                      }}
                    >
                      <option value="">Select size</option>
                      <option value="Small">Small</option>
                      <option value="Medium">Medium</option>
                      <option value="Large">Large</option>
                    </select>

                    <div className={styles.colorPickerRow}>

                      {/* hidden real color input */}
                      <input
                        type="color"
                        id={`color-${i}`}
                        value={v.color || "#000000"}
                        onChange={(e) => {
                          const copy = [...pscs];
                          copy[i].color = e.target.value;
                          setPscs(copy);
                        }}
                        className={styles.hiddenColorInput}
                      />

                      {/* clickable circle */}
                      <div
                        className={styles.colorCircle}
                        style={{ background: v.color || "#000000" }}
                        onClick={() => {
                          document.getElementById(`color-${i}`).click();
                        }}
                      />

                    </div>

                    <input
                      type="number"
                      placeholder="Stock"
                      value={v.stock}
                      onChange={(e) => {
                        const copy = [...pscs];
                        copy[i].stock = e.target.value;
                        setPscs(copy);
                      }}
                    />

                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => removePscs(i)}
                    >
                      Remove
                    </button>

                  </div>
                ))}

                <button type="button" className={styles.secondaryBtn} onClick={addPscs}>+ Add Variant</button>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.secondaryBtn} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.primaryBtn}>Save</button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsManagerView;