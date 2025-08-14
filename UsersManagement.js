import React, { useEffect, useState } from "react";
import axios from "axios";
import UserForm from "./UserForm";
import Modal from "./Modal";
import StatusBadge from "./StatusBadge";
import { Th, Info } from "./TableHelpers";
import { FaTrash } from "react-icons/fa";
import "./UsersManagement.css";

const BASE_URL = "http://localhost:5000";
const rowsPerPage = 10;

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [openView, setOpenView] = useState(null);
  const [openEdit, setOpenEdit] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState([]); // selected rows

  const fetchUsers = async (pageNum = 1, query = "") => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/users`, { params: { page: pageNum, limit: rowsPerPage, search: query } });
      setUsers(res.data.users || []);
      setTotal(res.data.total || 0);
      setPage(res.data.page || 1);
    } catch (e) { console.error(e); alert("Users fetch error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(1, search); }, [search]);

  const createUser = async (formData) => {
    try {
      await axios.post(`${BASE_URL}/api/users`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      setOpenCreate(false);
      fetchUsers(page, search);
    } catch (e) { console.error(e); alert(e.response?.data?.error || "Create failed"); }
  };

  const updateUser = async (id, formData) => {
    try {
      await axios.put(`${BASE_URL}/api/users/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      setOpenEdit(null);
      fetchUsers(page, search);
    } catch (e) { console.error(e); alert("Update failed"); }
  };

  const deleteSelected = async () => {
    if (selected.length === 0) return alert("Select at least one user to delete");
    if (!window.confirm("Delete selected users?")) return;

    try {
      await Promise.all(selected.map(id => axios.delete(`${BASE_URL}/api/users/${id}`)));
      setSelected([]);
      fetchUsers(page, search);
    } catch (e) { console.error(e); alert("Delete failed"); }
  };

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const totalPages = Math.ceil(total / rowsPerPage);

  return (
    <div className="um-container">

      <div className="um-topbar">
        <button className="um-btn-trash" onClick={deleteSelected}><FaTrash /></button>
        <button onClick={()=>setOpenCreate(true)} className="um-btn-primary">+ Create User</button>
        <input 
          value={search} 
          onChange={e=>setSearch(e.target.value)} 
          placeholder="Search" 
          className="um-input-search"
        />
      </div>

      <div className="um-table-wrapper">
        <table className="um-table">
          <thead>
            <tr>
              <th><input type="checkbox" onChange={e => {
                if (e.target.checked) setSelected(users.map(u=>u.id));
                else setSelected([]);
              }} checked={selected.length === users.length && users.length>0}/></th>
              <Th label="Username" />
              <Th label="Email" />
              <Th label="Full Name" />
              <Th label="Status" />
              <Th label="Role" />
              <Th label="Created" />
              <th className="um-actions-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (<tr><td colSpan={9} className="um-text-center">Loading…</td></tr>)
            : users.length ? users.map((u,i)=>(
              <tr key={u.id}>
                <td><input type="checkbox" checked={selected.includes(u.id)} onChange={()=>toggleSelect(u.id)}/></td>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>{u.first_name} {u.last_name}</td>
                <td><StatusBadge status={u.status}/></td>
                <td>{u.role}</td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="um-actions">
                  <button onClick={()=>setOpenView(u)}>View</button>
                  <button onClick={()=>setOpenEdit(u)}>Edit</button>
                </td>
              </tr>
            )) : (<tr><td colSpan={9} className="um-text-center">No users found</td></tr>)}
          </tbody>
        </table>
      </div>

      <div className="um-pagination">
        {Array.from({length: totalPages}, (_,i)=>(
          <button key={i} onClick={()=>fetchUsers(i+1, search)} className={page===i+1 ? "active" : ""}>{i+1}</button>
        ))}
      </div>

      <Modal open={openCreate} onClose={()=>setOpenCreate(false)} title="Create User">
        <UserForm onSubmit={createUser} submitLabel="Create"/>
      </Modal>

      <Modal open={!!openView} onClose={()=>setOpenView(null)} title="User Details">
  {openView && (
    <div className="um-user-details">
      <div className="um-avatar-circle-large">
        {openView.image_path ? (
          <img 
            src={openView.image_path.startsWith("http") ? openView.image_path : `${BASE_URL}${openView.image_path}`} 
            alt="avatar" 
          />
        ) : (
          "🤖"
        )}
      </div>
      <Info label="Username" value={openView.username}/>
      <Info label="Full Name" value={`${openView.first_name} ${openView.last_name}`}/>
      <Info label="Email" value={openView.email}/>
      <Info label="Gender" value={openView.gender || "—"}/>
      <Info label="Phone Number" value={openView.phone_number || "—"}/>
      <Info label="Status" value={<StatusBadge status={openView.status}/>}/>
      <Info label="Role" value={openView.role}/>
      <Info label="Created" value={new Date(openView.created_at).toLocaleDateString()}/>
    </div>
  )}
</Modal>

      <Modal open={!!openEdit} onClose={()=>setOpenEdit(null)} title="Update User">
        {openEdit && <UserForm initial={openEdit} onSubmit={(data)=>updateUser(openEdit.id,data)} submitLabel="Update"/>}
      </Modal>
    </div>
  );
}
