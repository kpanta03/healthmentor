import React,{useState, useEffect,useContext} from 'react';
import UserList from '../../components/admin/UserList';
import CreateNewUser from '../../components/admin/CreateNewUser';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

function AdminUsers() {
   const [activeButton, setActiveButton] = useState('viewAllUsers');
   const [showAllUsers, setShowAllUsers] = useState(true);
    const [createNewUser, setCreateNewUser] = useState(false);
    const { auth } = useContext(AuthContext);

    const [stats, setStats] = useState({
    total_users: 0,
    active_users: 0,
    inactive_users: 0,
    admin_users: 0,
  });

   const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/user/admin-dashboard/stats/', {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });
        setStats(res.data);
      } catch (error) {
        console.error("Failed to fetch user stats", error);
      }
    };

  useEffect(() => {
    fetchStats();
  }, [auth.token]);

  const handleViewAllUsers = () => {
    setActiveButton('viewAllUsers'); // Set active button to "View All Blogs"
    setShowAllUsers(true);
    setCreateNewUser(false);
  };
  const handleCreateNewUser = () => {
    setActiveButton('createNewUser');
    setCreateNewUser(true);
    setShowAllUsers(false);
  }

  return (
    <div className="main-content" style={{backgroundColor:"white"}}>
       {/* heading */}

        <div className="header d-flex justify-content-between align-items-center mb-5 px-lg-4 p-2">
            <h3 className="m-0"><i className="fas fa-users"></i> User Management</h3>
        </div>

         {/* <!-- stat rows --> */}
        <div className="container mb-4">
            <div className="row">
              
                <div className="col-12 col-md-6 col-lg-6 col-xl-3 mb-4">
                    <div className="stat-card">
                        <div className="stat-icon users">
                            <i className="fas fa-users"></i>
                        </div>
                        <div className="stat-content">
                            <h3>{stats.total_users}</h3>
                            <p>Total Users</p>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-6 col-lg-6  col-xl-3 mb-4">
                    <div className="stat-card">
                        <div className="stat-icon active">
                            <i className="fas fa-user-check"></i>
                        </div>
                        <div className="stat-content">
                            <h3>{stats.active_users}</h3>
                            <p>Active Users</p>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-7 col-lg-6 col-xl-3 mb-4">
                    <div className="stat-card">
                        <div className="stat-icon inactive">
                            <i className="fas fa-user-times"></i>
                        </div>
                        <div className="stat-content">
                            <h3>{stats.inactive_users}</h3>
                            <p>Inactive Users</p>
                        </div>
                    </div>
                </div>

                 <div class="col-12 col-md-6 col-lg-6 col-xl-3 mb-4">
                    <div class="stat-card">
                        <div class="stat-icon admins">
                            <i class="fas fa-user-shield"></i>
                        </div>
                        <div class="stat-content">
                            <h3>{stats.admin_users}</h3>
                            <p>Administrators</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* <!-- User Actions --> */}
        <div className="blog-actions mt-4">
            <h4 className="section-title mb-4">Quick Actions</h4>
            <div className="action-buttons card p-4 shadow-sm rounded">
                <div className="row g-4">
                  {/* view all users button */}
                    <div className="col-6 col-sm-6  col-xl-3">
                          <button
                              className={`btn-action w-100 ${activeButton === 'viewAllUsers' ? 'active' : ''}`}
                              onClick={handleViewAllUsers}>
                              <i className="fas fa-list"></i> View All Users
                          </button>
                    </div>
                     {/* create new user button */}
                    <div className="col-6 col-sm-6  col-xl-3">
                          <button
                              className={`btn-action w-100 ${activeButton === 'createNewUser' ? 'active' : ''}`}
                              onClick={handleCreateNewUser}>
                              <i className="fas fa-list"></i> Create New User
                          </button>
                    </div> 
                </div>
            </div>
        </div>

        {showAllUsers && <UserList refreshStats={fetchStats} />}

        {createNewUser && <CreateNewUser refreshStats={fetchStats}/>}

    </div>
  )
}

export default AdminUsers
