import React, { useEffect, useState } from 'react';
import { Plus, Edit, X, Trash2 } from 'lucide-react';
import DashboardTable from '../../../components/dashboard/common/DashboardTable';
import styles from './DashboardViews.module.css';
import { API, address, myFetch } from "../../../api";

const UsersManagerView = () => {
  const token = localStorage.getItem("token");

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [editingUser, setEditingUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [confirmPopup, setConfirmPopup] = useState(null);
  const [infoPopup, setInfoPopup] = useState(null);

  // ================= FETCH =================
  const fetchUsers = async () => {
    const res = await myFetch(`${API}/api/users/get`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ================= FILTER =================
  useEffect(() => {
    let result = users;

    if (roleFilter !== "ALL") {
      result = result.filter(u => u.userRole === roleFilter);
    }

    if (statusFilter !== "ALL") {
      result = result.filter(u =>
        statusFilter === "ACTIVE" ? u.active : !u.active
      );
    }

    setFilteredUsers(result);
  }, [users, roleFilter, statusFilter]);

  // ================= POPUPS =================
  const showInfo = (msg) => setInfoPopup(msg);

  const askConfirm = (message, onConfirm) => {
    setConfirmPopup({ message, onConfirm });
  };

  // ================= SAVE USER =================
  const saveUser = async (e) => {
    e.preventDefault();
    const form = e.target;

    const body = {
      userName: form.name.value,
      userEmail: form.email.value,
      userPassword: form.password.value,
      userRole: form.role.value,
      active: form.status.value === "true"
    };

    try {
      if (editingUser) {
        // update role
        await myFetch(`${API}/api/users/patch/Role/${editingUser.userId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ userRole: body.userRole })
        });

        // update status (YOU NEED THIS ENDPOINT IN BACKEND)
        await myFetch(`${API}/api/users/patch/status/${editingUser.userId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ active: body.active })
        });

        showInfo("User updated");
      } else {
        console.log(body);
        await myFetch(`${API}/api/users/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(body)
        });

        showInfo("User created");
      }

      setIsModalOpen(false);
      setEditingUser(null);
      fetchUsers();

    } catch (err) {
      showInfo("Error saving user");
    }
  };

  // ================= DELETE =================
  const deleteUser = (id) => {
    askConfirm("Delete user?", async () => {
      await myFetch(`${API}/api/users/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      showInfo("User deleted");
      fetchUsers();
    });
  };

  // ================= TABLE =================
  const columns = [
    {
      header: "User",
      render: (u) => (
        <div className={styles.userCell}>
          <img src={u.userImage} className={styles.userAvatar} />
          <span>{u.userName}</span>
        </div>
      )
    },
    { header: "Email", accessor: "userEmail" },
    { header: "Address", accessor: "shipping" },

    {
      header: "Status",
      render: (u) => (
        <span className={u.active ? styles.statusLive : styles.statusDraft}>
          {u.active ? "Active" : "Inactive"}
        </span>
      )
    },

    { header: "Role", accessor: "userRole" },

    {
      header: "Created",
      render: (u) =>
        u.creationdate
          ? new Date(u.creationdate).toLocaleDateString()
          : "-"
    },

    {
      header: "Actions",
      render: (u) => (
        <div className={styles.actionButtons}>
          <button
            className={styles.actionBtnEdit}
            onClick={() => {
              setEditingUser(u);
              setIsModalOpen(true);
            }}
          >
            <Edit size={16}/>
          </button>

          <button
            className={styles.actionBtnDelete}
            onClick={() => deleteUser(u.userId)}
          >
            <Trash2 size={16}/>
          </button>
        </div>
      )
    }
  ];

  return (
    <div className={styles.viewContainer}>

      {/* HEADER */}
      <div className={styles.viewHeaderWithAction}>
        <div>
          <h2>User Management</h2>
          <p>Manage users, roles, and access.</p>
        </div>

        <button
          className={styles.primaryBtn}
          onClick={() => {
            setEditingUser(null);
            setIsModalOpen(true);
          }}
        >
          <Plus size={18}/> Add User
        </button>
      </div>

      {/* FILTERS */}
      <div className={styles.filterRow}>

        <div className={styles.filterGroup}>
          <label>Role</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="ALL">All Roles</option>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
            <option value="PRODUCT_MANAGER">PRODUCT MANAGER</option>
            <option value="MARKETING_MANAGER">MARKETING MANAGER</option>
            <option value="ORDERS_MANAGER">ORDERS MANAGER</option>
            <option value="SUPPORT_MANAGER">SUPPORT MANAGER</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="ALL">All</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

      </div>

      {/* TABLE */}
      <DashboardTable
        columns={columns}
        data={filteredUsers}
        emptyStateMessage="No users found."
      />

      {/* MODAL */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>

            <div className={styles.modalHeader}>
              <h3>{editingUser ? "Edit User" : "Create User"}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className={styles.closeBtn}
              >
                <X size={20}/>
              </button>
            </div>

            <form onSubmit={saveUser} className={styles.modalForm}>

              {/* NAME */}
              <div className={styles.formGroup}>
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingUser?.userName}
                  disabled={!!editingUser}
                  required
                />
              </div>

              {/* PASSWORD */}
                  <div className={styles.formGroup}>
                    <label>Password</label>
                    <input
                      type="password"
                      name="password"
                      placeholder={editingUser ? "Cannot edit password here" : "Password"}
                      disabled={!!editingUser}
                      required={!editingUser}
                    />
                  </div>

              {/* EMAIL */}
              <div className={styles.formGroup}>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={editingUser?.userEmail}
                  disabled={!!editingUser}
                  required
                />
              </div>

              {/* ROLE */}
              <div className={styles.formGroup}>
                <label>Role</label>
                <select
                  name="role"
                  defaultValue={editingUser?.userRole || "USER"}
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="PRODUCT_MANAGER">PRODUCT MANAGER</option>
                  <option value="MARKETING_MANAGER">MARKETING MANAGER</option>
                  <option value="ORDERS_MANAGER">ORDERS MANAGER</option>
                  <option value="SUPPORT_MANAGER">SUPPORT MANAGER</option>
                </select>
              </div>

              {/* STATUS */}
              <div className={styles.formGroup}>
                <label>Status</label>
                <select
                  name="status"
                  defaultValue={editingUser?.active ? "true" : "false"}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>

                <button type="submit" className={styles.primaryBtn}>
                  Save
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
      {/* CONFIRM POPUP */}
            {confirmPopup && (
              <div className={styles.modalOverlay}>
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
                className={styles.modalOverlay}
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

    </div>
  );
};

export default UsersManagerView;