import React, { useState, useEffect } from 'react';

const Users = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/users');
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users data:', error);
    }
  };

  const handleRemoveUser = async (userId) => {
  try {
    const response = await fetch(`http://127.0.0.1:5000/users/${userId}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      // Remove the deleted user from the users state
      setUsers(users.filter(user => user._id !== userId));
    } else {
      console.error('Failed to delete user:', response.statusText);
    }
  } catch (error) {
    console.error('Error deleting user:', error);
  }
};


  return (
    <div className="container mt-4">
      <h1 className="mb-4">User Management</h1>
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>Actions</th> {/* New column for actions */}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.username}</td>
                <td>{user.role}</td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleRemoveUser(user._id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
