const express = require('express');
const multer = require('multer');
const fs = require('fs');
const db = require('../db'); // your database connection
const router = express.Router();

// Ensure uploads/profile_images folder exists
const uploadDir = 'uploads/profile_images/';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Get all users with pagination and search
router.get('/', (req, res) => {
    const search = req.query.search || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const searchTerm = `%${search}%`;
    const sql = `
      SELECT * FROM users
      WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR username LIKE ? OR role LIKE ?
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `;
    db.query(sql, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, limit, offset], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        // Get total count for pagination
        db.query(`SELECT COUNT(*) as total FROM users WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR username LIKE ? OR role LIKE ?`, 
        [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm], (err2, countRes) => {
            if(err2) return res.status(500).json({ error: err2.message });
            res.json({ users: results, total: countRes[0].total, page });
        });
    });
});

// Create user (without bcrypt)
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { first_name, last_name, email, username, status, gender, phone_number, role, password } = req.body;
        if (!first_name || !last_name || !email || !username || !password)
            return res.status(400).json({ error: "Missing required fields" });

        // No bcrypt here — directly save password
        const imagePath = req.file ? `/uploads/profile_images/${req.file.filename}` : null;

        const sql = `INSERT INTO users 
            (first_name, last_name, email, username, status, gender, phone_number, role, password, image_path, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;

        db.query(sql, [first_name, last_name, email, username, status, gender, phone_number, role, password, imagePath], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "User created successfully", filePath: imagePath });
        });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// Update user
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const { first_name, last_name, email, username, status, gender, phone_number, role } = req.body;
        const imagePath = req.file ? `/uploads/profile_images/${req.file.filename}` : null;

        let sql, params;
        if(imagePath){
            sql = `UPDATE users SET first_name=?, last_name=?, email=?, username=?, status=?, gender=?, phone_number=?, role=?, image_path=? WHERE id=?`;
            params = [first_name, last_name, email, username, status, gender, phone_number, role, imagePath, req.params.id];
        } else {
            sql = `UPDATE users SET first_name=?, last_name=?, email=?, username=?, status=?, gender=?, phone_number=?, role=? WHERE id=?`;
            params = [first_name, last_name, email, username, status, gender, phone_number, role, req.params.id];
        }

        db.query(sql, params, (err) => {
            if(err) return res.status(500).json({ error: err.message });
            res.json({ message: "User updated successfully", filePath: imagePath });
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete user
router.delete('/:id', (req, res) => {
    const sql = `DELETE FROM users WHERE id=?`;
    db.query(sql, [req.params.id], (err) => {
        if(err) return res.status(500).json({ error: err.message });
        res.json({ message: "User deleted successfully" });
    });
});

module.exports = router;
