import React, { useState } from "react";
import AvatarPicker from "./AvatarPicker";

export default function UserForm({ initial = {}, onSubmit, submitLabel = "Submit" }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    status: "Active",
    gender: "",
    phone_number: "",
    role: "Host",
    password: "",
    image_path: "",
    ...initial,
  });
  const [imageFile, setImageFile] = useState(null);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === "image_path") return; // image ka purana URL backend ko mat bhejo
      if (k === "password" && !v) return; // agar password khali hai to skip karo
      data.append(k, v);
    });
    if (imageFile) data.append("image", imageFile);
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="um-form">
      <AvatarPicker valueUrl={form.image_path} onFile={setImageFile} />

      <label>First Name</label>
      <input name="first_name" value={form.first_name} onChange={handle} required />

      <label>Last Name</label>
      <input name="last_name" value={form.last_name} onChange={handle} required />

      <label>Email</label>
      <input type="email" name="email" value={form.email} onChange={handle} required />

      <label>Username</label>
      <input name="username" value={form.username} onChange={handle} required />

      <label>Status</label>
      <select name="status" value={form.status} onChange={handle}>
        <option>Active</option>
        <option>Inactive</option>
      </select>

      <label>Gender</label>
      <select name="gender" value={form.gender} onChange={handle}>
        <option value="">Select</option>
        <option>Male</option>
        <option>Female</option>
        <option>Other</option>
      </select>

      <label>Phone Number</label>
      <input name="phone_number" value={form.phone_number} onChange={handle} />

      <label>Role</label>
      <select name="role" value={form.role} onChange={handle}>
        <option>Host</option>
        <option>Admin</option>
        <option>Organization Admin</option>
      </select>

      <label>{initial?.id ? "New Password (optional)" : "Set Password"}</label>
      <input
        type="password"
        name="password"
        value={form.password}
        onChange={handle}
        {...(!initial?.id ? { required: true } : {})}
      />

      <button type="submit">{submitLabel}</button>
    </form>
  );
}
