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
  const [placement, setPlacement] = useState("FLOOR");
  const [modelWidth, setModelWidth] = useState("");
  const [modelHeight, setModelHeight] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  let hasSizeUpdate = false;
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
  try {
    setUploading(true);
    setProgress(10);

    const id = editingModel.pId;

    let hasUpload = false;
    let hasPlacementUpdate = false;

    // =========================
    // 1. UPLOAD MODEL (ONLY IF FILE SELECTED)
    // =========================
    if (modelFile) {
      hasUpload = true;

      const fd = new FormData();
      fd.append("file", modelFile);

      const uploadRes = await myFetch(
        `${API}/api/products/upload-model/${id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: fd
        }
      );

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      await uploadRes.json();
      setProgress(60);
    }

    // =========================
    // 2. UPDATE PLACEMENT (ONLY IF CHANGED)
    // =========================
    if (placement && placement !== editingModel.pPlacement) {
      hasPlacementUpdate = true;

      const placementRes = await myFetch(
        `${API}/api/products/update-placement/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Bearer ${token}`
          },
          body: new URLSearchParams({
            placement
          })
        }
      );

      if (!placementRes.ok) {
        const errorText = await placementRes.text();
        throw new Error(`Placement update failed: ${errorText}`);
      }

      if (
        modelWidth !== (editingModel.pWidth || 0) ||
        modelHeight !== (editingModel.pHeight || 0)
      ) {
        hasSizeUpdate = true;

        const sizeRes = await myFetch(
          `${API}/api/products/update-size/${id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Bearer ${token}`
            },
            body: new URLSearchParams({
              pWidth: modelWidth,
              pHeight: modelHeight
            })
          }
        );

        if (!sizeRes.ok) {
          const errorText = await sizeRes.text();
          throw new Error(`Size update failed: ${errorText}`);
        }
      }

      setProgress(hasUpload ? 80 : 60);
    }

    // =========================
    // NOTHING CHANGED
    // =========================
    if (!hasUpload && !hasPlacementUpdate && !hasSizeUpdate) {
      setUploading(false);
      setProgress(0);
      setEditingModel(null);
      setModelFile(null);
      return;
    }

    setProgress(100);

    setTimeout(() => {
      setUploading(false);
      setProgress(0);
      setEditingModel(null);
      setModelFile(null);
      fetchProducts();
    }, 300);

  } catch (err) {
    console.error(err);
    alert(err.message || "Failed to save model");
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
                onChange={(e) => {
                  const file = e.target.files[0];
                  setModelFile(file);

                  if (file) {
                    const url = URL.createObjectURL(file);
                    setPreviewUrl(url);
                  }
                }}
              />
            </label>

          </div>

          {/* PLACEMENT SELECTOR */}
          <div className={styles.placementRow}>
            <span>Placement:</span>

            <button
              className={styles.secondaryBtn}
              onClick={() => {
                setPlacement(prev =>
                  prev === "FLOOR"
                    ? "WALL"
                    : prev === "WALL"
                    ? "CEILING"
                    : "FLOOR"
                );
              }}
            >
              {placement === "FLOOR" && "GROUND"}
              {placement === "WALL" && "WALL"}
              {placement === "CEILING" && "CEILING"}
            </button>
          </div>

          <div className={styles.sizeRow}>
            <span>Width:</span>
            <input
              type="number"
              value={modelWidth}
              onChange={(e) => setModelWidth(e.target.value)}
              className={styles.input}
            />
            <span>Cm</span>
          </div>

          <div className={styles.sizeRow}>
            <span>Height:</span>
            <input
              type="number"
              value={modelHeight}
              onChange={(e) => setModelHeight(e.target.value)}
              className={styles.input}
            />
            <span>Cm</span>
          </div>

          {/* MODEL INFO */}
          <div className={styles.modelInfo}>
            {!editingModel.p3DModel && !modelFile && (
              <p>Please add a model</p>
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
                src={
                  previewUrl
                    ? previewUrl
                    : editingModel.p3DModel
                }
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
              onClick={() => {
                setEditingModel(null);
                setPreviewUrl(null);
                setModelFile(null);
                setModelWidth(0);
                setModelHeight(0);
              }}
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

    {uploading && (
      <div className={styles.oomodalOverlay}>
        <div className={styles.uploadPopup}>

          <h3>Uploading Model...</h3>

          <div className={styles.loadingBar}>
            <div
              className={styles.loadingFill}
              style={{ width: `${progress}%` }}
            />
          </div>

          <p>{progress}%</p>

        </div>
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
              onClick={() => {
                setEditingModel(p);
                setPlacement(p.pPlacement || "FLOOR");
                setModelWidth(p.pWidth || 0);
                setModelHeight(p.pHeight || 0);
              }}
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