
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../App.css"

const AdminDashboard = () => {

    const [users, setUsers] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [editableUserId, setEditableUserId] = useState(null);
    const [isAllSelected, setIsAllSelected]= useState(false);
    const [editedUserData, setEditedUserData] = useState({
      id: null,
      name: '',
      email: '',
      role: '',
    });
  const itemsPerPage = 10;

  useEffect(() => {
    axios.get('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json')
      .then(response => setUsers(response.data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to the first page when searching
  };

  const handleSelectRow = (id) => {
    const isSelected = selectedRows.includes(id);
    if (isSelected) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const handleDeleteSelected = () => {
    const updatedUsers = users.filter(user => !selectedRows.includes(user.id));
    setUsers(updatedUsers);
    setSelectedRows([]);
  };

  const handleDeleteUser = (user) => {
    const updatedUsers = users.filter(existingUser => existingUser !== user);
    setUsers(updatedUsers);
  }

  const handleEdit = (userId) => {
    const userToEdit = users.find(user => user.id === userId);
    setEditableUserId(userId);
    setEditedUserData(userToEdit);
  };

  const handleSave = () => {
    if (
        editedUserData.name.trim() !== '' &&
        editedUserData.email.trim() !== '' &&
        editedUserData.role.trim() !== ''
      ) {
        const updatedUsers = users.map(user =>
          user.id === editedUserData.id ? { ...user, ...editedUserData } : user
        );
    
        setUsers(updatedUsers);
        setEditableUserId(null);
        setEditedUserData({
          id: null,
          name: '',
          email: '',
          role: '',
        });
      } else {
        alert('Please fill in all fields before saving.');
      }
  }

  const handleCancelEdit = () => {
    setEditableUserId(null);
    setEditedUserData({
      id: null,
      name: '',
      email: '',
      role: '',
    });
  }
  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    Object.values(user).some(value =>
      value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleDeleteAll=()=>{
    setUsers([]);
  }

  const handleSelectAll = () => {
    const currentItemsIds = users
      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
      .map(user => user.id);

    if (selectedRows.length === currentItemsIds.length) {
      // Deselect all if all are currently selected
      setSelectedRows([]);
    } else {
      // Select only users from the current page
      setSelectedRows(currentItemsIds);
    }
  };

  // Paginate the data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className='main-container'>
        <input className='search-input'
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={handleSearch}
      />
      <button onClick={()=>handleDeleteAll()} className='bin'>Delete All</button>
      <table className='main-table' border={1}>
        <thead className='table-head'>
          <tr className='table-row'>
            <th><button className='select-all' onClick={handleSelectAll}>{!isAllSelected?"Select all":"Remove all"}</button></th>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
      <tbody className='table-body'>
        {currentItems.map(user => (
          <tr className='check-box' key={user.id} style={{ background: selectedRows.includes(user.id) ? '#ccc' : 'transparent' }}>
            <td>
              <input
                type="checkbox"
                onChange={() => handleSelectRow(user.id)}
                checked={selectedRows.includes(user.id)}
              />
            </td>
            <td>{user.id}</td>
            <td>
              {editableUserId === user.id ? (
                <input className='userdata-input'
                  type="text"
                  value={editedUserData.name}
                  onChange={(e) => setEditedUserData({ ...editedUserData, name: e.target.value })}
                />
              ) : (
                user.name
              )}
            </td>
            <td>
              {editableUserId === user.id ? (
                <input className='userdata-input'
                  type="text"
                  value={editedUserData.email}
                  onChange={(e) => setEditedUserData({ ...editedUserData, email: e.target.value })}
                />
              ) : (
                user.email
              )}
            </td>
            <td>{user.role}</td>
            <td className='update-buttons'>

              {editableUserId === user.id ? (
                <div className='edit-options'>
                  <img onClick={handleCancelEdit} className='cancel' alt='cancel icon' src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhptsOjCS8_GgHlQzmvrP9_8pCQowWFxjYlg&usqp=CAU'/>
                  <img onClick={handleSave} className='save' src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpOEvlFuV4Cf0GnAjH8ZL3or6QcqKQJXnjZg&usqp=CAU' alt='save icon'/>
                </div>
              ) : (
                <button className='edit btn' onClick={() => handleEdit(user.id)}>Edit</button>
              )}
              <button className='delete btn' onClick={() => handleDeleteUser(user)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
      </table>

      <button className='delete-all' onClick={handleDeleteSelected} disabled={selectedRows.length === 0}>Delete Selected</button>

      {/* pagination */}
      <div className='pagination'>
        <button className='first-btn' onClick={() => setCurrentPage(1)}>First Page</button>
        <button className='previous-btn' onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>Previous Page</button>
        <span>{currentPage}</span>
        <button className='next-btn' onClick={() => setCurrentPage(currentPage + 1)} disabled={indexOfLastItem >= filteredUsers.length}>Next Page</button>
        <button className='last-btn' onClick={() => setCurrentPage(Math.ceil(filteredUsers.length / itemsPerPage))}>Last Page</button>
      </div>
    </div>
  );
};

export default AdminDashboard;
