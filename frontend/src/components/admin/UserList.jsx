import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

function UserList({ refreshStats }) {
    const { auth } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('view'); // 'view' or 'edit'
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        fetchUsers()
    }, [search, roleFilter, statusFilter]);

    const fetchUsers = async () => {
        try {
            const response = await axios.get(
                `http://localhost:8000/api/user/admin-dashboard/`,
                {
                    headers: { Authorization: `Bearer ${auth.token}` },
                    params: {
                        search,
                        role: roleFilter,
                        status: statusFilter
                    }
                }
            );
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const openModal = (user, type) => {
        setSelectedUser({
            ...user,
            is_admin: !!user.is_admin,
            is_active: !!user.is_active,
        });
        setModalType(type);
        setShowModal(true);
    };

    const closeModal = () => {
        setSelectedUser(null);
        setShowModal(false);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setSelectedUser({
            ...selectedUser,
            [name]: value,
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: selectedUser.name,
                is_admin: selectedUser.is_admin === true || selectedUser.is_admin === 'true',
                is_active: selectedUser.is_active === true || selectedUser.is_active === 'true',
            };
            
            await axios.put(
                `http://localhost:8000/api/user/admin-dashboard/update/${selectedUser.email}/`,
                payload,
                { headers: { Authorization: `Bearer ${auth.token}` } }
            );
            
            fetchUsers();
            closeModal();
            refreshStats();
            // Optional: Show success message
            alert('User updated successfully!');
        } catch (error) {
            console.error("Error updating user:", error);
            // Optional: Show error message
            alert('Error updating user. Please try again.');
        }
    };

    return (
        <>
            <div className="mt-4">
                <h4 className="section-title mb-4">User Management</h4>

                {/* Search and Filter Section */}
                <div className="card p-4 shadow-sm rounded mb-4">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <input
                                type="text"
                                className="form-control search-input"
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="col-md-3">
                            <select className="form-select filter-dropdown" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                                <option value="all">All Roles</option>
                                <option value="admin">Admin</option>
                                <option value="user">User</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <select className="form-select filter-dropdown" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div className="col-md-2">
                            <button className="btn btn-outline-secondary w-100" onClick={() => {
                                setSearch('');
                                setRoleFilter('all');
                                setStatusFilter('all');
                            }}
                            >Clear</button>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="card shadow-sm rounded">
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="px-4 py-3">User</th>
                                        <th className="px-4 py-3">Email</th>
                                        <th className="px-4 py-3">Role</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Joined</th>
                                        <th className="px-4 py-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.email}>
                                            <td className="px-4 py-3">
                                                <div className="d-flex align-items-center">
                                                    <div className="user-avatar">{user.name[0]}</div>
                                                    <div>
                                                        <div className="fw-medium text-dark">{user.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-muted">{user.email}</td>

                                            <td className="px-4 py-3">
                                                <span className={`badge ${user.is_admin ? 'bg-primary' : 'bg-secondary'}`}>
                                                    {user.is_admin ? 'ADMIN' : 'USER'}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3">
                                                <span className={`badge ${user.is_active ? 'bg-success' : 'bg-danger'}`}>
                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3 text-muted"> {new Date(user.created_at).toLocaleDateString()}</td>

                                            <td className="px-4 py-3">
                                                <div className="d-flex justify-content-center gap-2">

                                                    {/* View Details */}
                                                    <button
                                                        className="btn btn-sm btn-outline-info"
                                                        title="View Details"
                                                         onClick={() => openModal(user, 'view')}
                                                    >
                                                        <i className="fas fa-eye"></i>
                                                    </button>

                                                    {/* Edit User */}
                                                    <button
                                                        className="btn btn-sm btn-outline-warning"
                                                        title="Edit User"
                                                        onClick={() => openModal(user, 'edit')}
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>

                                                    {/* Toggle Active/Inactive */}
                                                    <button
                                                        className="btn btn-sm btn-outline-secondary"
                                                        title={user.is_active ? "Deactivate" : "Activate"}
                                                        onClick={async () => {
                                                            try {
                                                                await axios.patch(
                                                                    `http://localhost:8000/api/user/admin-dashboard/toggle/${user.email}/`,
                                                                    {},
                                                                    { headers: { Authorization: `Bearer ${auth.token}` } }
                                                                );
                                                                refreshStats();
                                                                fetchUsers(); // refresh list
                                                            } catch (error) {
                                                                console.error("Error toggling user:", error);
                                                            }
                                                        }}
                                                    >
                                                        <i className={`fas ${user.is_active ? 'fa-user-times' : 'fa-user-check'}`}></i>
                                                    </button>

                                                    {/* Delete */}
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        title="Delete User"
                                                        onClick={async () => {
                                                            if (window.confirm(`Delete ${user.email}?`)) {
                                                                try {
                                                                    await axios.delete(
                                                                        `http://localhost:8000/api/user/admin-dashboard/delete/${user.email}/`,
                                                                        { headers: { Authorization: `Bearer ${auth.token}` } }
                                                                    );
                                                                    refreshStats();
                                                                    fetchUsers();
                                                                } catch (error) {
                                                                    console.error("Error deleting user:", error);
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Modal */}
                {showModal && selectedUser && (
                    <div className="modal fade show d-block" tabIndex="-1" onClick={closeModal}>
                        <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        {modalType === 'view' ? 'User Details' : 'Edit User'}
                                    </h5>
                                    <button type="button" className="btn-close" onClick={closeModal}></button>
                                </div>
                                <div className="modal-body">
                                    {modalType === 'view' ? (
                                        <>
                                            <p><strong>Name:</strong> {selectedUser.name}</p>
                                            <p><strong>Email:</strong> {selectedUser.email}</p>
                                            <p><strong>Role:</strong> {selectedUser.is_admin ? 'Admin' : 'User'}</p>
                                            <p><strong>Status:</strong> {selectedUser.is_active ? 'Active' : 'Inactive'}</p>
                                            <p><strong>Joined:</strong> {new Date(selectedUser.created_at).toLocaleDateString()}</p>
                                        </>
                                    ) : (
                                        <form onSubmit={handleEditSubmit}>
                                            <div className="mb-3">
                                                <label className="form-label">Name</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="name"
                                                    value={selectedUser.name}
                                                    onChange={handleEditChange}
                                                    required
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Role</label>
                                                <select
                                                    className="form-select"
                                                    name="is_admin"
                                                    value={selectedUser.is_admin.toString()}
                                                    onChange={handleEditChange}
                                                >
                                                    <option value="false">User</option>
                                                    <option value="true">Admin</option>
                                                </select>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Status</label>
                                                <select
                                                    className="form-select"
                                                    name="is_active"
                                                    value={selectedUser.is_active.toString()}
                                                    onChange={handleEditChange}
                                                >
                                                    <option value="true">Active</option>
                                                    <option value="false">Inactive</option>
                                                </select>
                                            </div>
                                            <div className="d-flex gap-2">
                                                <button type="submit" className="btn btn-primary">Save Changes</button>
                                                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export default UserList