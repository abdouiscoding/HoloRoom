import React, { useEffect, useState } from 'react';
import styles from './DashboardViews.module.css';
import { API, address, myFetch } from "../../../api";

const ARManagerView = () => {
  const [products, setProducts] = useState([]);
  const [editingModel, setEditingModel] = useState(null);
  const [modelFile, setModelFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [arFilter, setArFilter] = useState("ALL");
  const token = localStorage.getItem("token");

  const fetchProducts = async () => {
    const res = await myFetch(`${API}/api/products/get`);
    setProducts(await res.json());
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const toggleAR = async (p) => {
  await myFetch(`${API}/api/products/ar/${p.pId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ pARSupport: !p.pARSupport })
  });

  fetchProducts();
};

  const uploadModelFile = async () => {
  if (!modelFile) return;

  try {
    const fd = new FormData();
    fd.append("file", modelFile);

    setUploading(true);
    setProgress(10);

    const res = await myFetch(`${API}/api/products/upload-model/${editingModel.pId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to upload model: ${errorText}`);
    }

    setProgress(80);

    await res.json();

    setProgress(100);

    setTimeout(() => {
      setUploading(false);
      setProgress(0);
      setEditingModel(null);
      setModelFile(null);
      fetchProducts();
    }, 300);
  } catch (err) {
    alert(err.message || "Failed to upload model");
    setUploading(false);
    setProgress(0);
  }
};

  return (
    <div className={styles.viewContainer}>
    <>
    {editingModel && (
      <div className={styles.modalOverlay} onClick={() => setEditingModel(null)}>

        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>

          {/* HEADER */}
          <div className={styles.modalHeaderRow}>
            <h3>
              {editingModel?.p3DModel ? "Model Editor" : "Add Model"}
            </h3>

            <label className={styles.uploadBtn}>
              Upload
              <input
                type="file"
                accept=".glb,.gltf"
                hidden
                onChange={(e) => setModelFile(e.target.files[0])}
              />
            </label>

          </div>

          {/* MODEL INFO */}
          <div className={styles.modelInfo}>
            {!editingModel.p3DModel && !modelFile && (
              <p>No model to display</p>
            )}

            {modelFile && (
              <p>Selected: {modelFile.name}</p>
            )}

            {!modelFile && editingModel.p3DModel && (
              <p>Current: {editingModel.p3DModel.split("/").pop()}</p>
            )}
          </div>

          {/* 3D VIEWER */}
          <div className={styles.modelViewer}>
            {editingModel.p3DModel ? (
              <model-viewer
                src={editingModel.p3DModel}
                auto-rotate
                camera-controls
                style={{ width: "100%", height: "300px" }}
              />
            ) : (
              <p>No model to preview</p>
            )}
          </div>

          {/* ACTIONS */}
          <div className={styles.modalActions}>

            <button
              className={styles.secondaryBtn}
              onClick={() => setEditingModel(null)}
            >
              Cancel
            </button>

            <button
              className={styles.primaryBtn}
              onClick={uploadModelFile}
            >
              Save
            </button>

          </div>

        </div>
      </div>
    )}

    {/*loading bar */}
    {uploading && (
      <div className={styles.loadingBar}>
        <div
          className={styles.loadingFill}
          style={{ width: `${progress}%` }}
        />
      </div>
    )}

    <div className={styles.viewHeaderWithAction}>
      <div>
        <h2>AR SUPPORT</h2>
        <p>
              View and manage 3d models and ar availibility for products.
            </p>
      </div>
    </div>
    <span>Filter by: </span>
    
    <div className={styles.filterRow} >
      <button
        className={styles.secondaryBtn}
        onClick={() =>
          setArFilter(prev =>
            prev === "ALL"
              ? "ENABLED"
              : prev === "ENABLED"
              ? "DISABLED"
              : "ALL"
          )
        }
      >
        {arFilter === "ALL" && "All"}
        {arFilter === "ENABLED" && "AR Enabled"}
        {arFilter === "DISABLED" && "AR Disabled"}
      </button>
    </div>
    
    {/*card */}
    <div className={styles.productGrid}>
      {products
        .filter(p => {
          if (arFilter === "ALL") return true;
          if (arFilter === "ENABLED") return p.pARSupport;
          if (arFilter === "DISABLED") return !p.pARSupport;
          return true;
        })
        .map(p => (
        <div key={p.pId} className={styles.productCard}>

          <img
            src={p.images?.[0]?.pImageUrl || "/placeholder.png"}
            className={styles.productImage}
          />

          <div className={styles.cardHeaderRow}>
            <h4>{p.pName}</h4>

            <span
              className={p.pARSupport ? styles.arEnabled : styles.arDisabled}
            >
              {p.pARSupport ? "AR Enabled" : "AR Disabled"}
            </span>
          </div>

          {/* TOGGLE BUTTON */}
          <div className={styles.arButtonRow}>

            <button
              className={styles.arBtn}
              onClick={() => toggleAR(p)}
            >
              {p.pARSupport ? "Disable AR" : "Enable AR"}
            </button>

            <button
              className={styles.arBtn}
              onClick={() => setEditingModel(p)}
            >
              Edit Model
            </button>

          </div>

        </div>
      ))}
    </div>
    </>
    </div>
  );
};

export default ARManagerView;