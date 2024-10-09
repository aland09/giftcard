const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 10 * 1024 * 1024 }, // Increase limit to 10MB
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png/;
        const mimeType = fileTypes.test(file.mimetype);
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());

        if (mimeType && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images Only (jpg, jpeg, png)');
        }
    }
});

app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Data storage
let birthdayData = {
    name: 'Nama',
    message: 'Selamat Ulang Tahun!',
    imagePath: '/api/placeholder/150/150',
    backgroundColor: '#FFF0F5',
    cardFrontColor: '#FFB6C1',
    cardBackColor: '#FFF0F5',
    textColor: '#FF69B4'
};

// API endpoints
app.get('/api/birthday-data', (req, res) => {
    res.json(birthdayData);
});

app.post('/api/update-birthday-data', (req, res) => {
    const { name, message, backgroundColor, cardFrontColor, cardBackColor, textColor } = req.body;
    if (name) birthdayData.name = name;
    if (message) birthdayData.message = message;
    if (backgroundColor) birthdayData.backgroundColor = backgroundColor;
    if (cardFrontColor) birthdayData.cardFrontColor = cardFrontColor;
    if (cardBackColor) birthdayData.cardBackColor = cardBackColor;
    if (textColor) birthdayData.textColor = textColor;
    res.json({ success: true });
});

app.post('/api/upload-image', upload.single('image'), (req, res) => {
    if (req.file) {
        const oldPath = birthdayData.imagePath;
        birthdayData.imagePath = '/uploads/' + req.file.filename;
        
        // Delete old image if it's not the placeholder
        if (oldPath !== '/api/placeholder/150/150') {
            const oldImagePath = path.join(__dirname, 'public', oldPath); // Path absolut
            if (fs.existsSync(oldImagePath)) { // Cek apakah file ada
                fs.unlink(oldImagePath, (err) => {
                    if (err) {
                        console.error('Failed to delete old image:', err); // Jika gagal dihapus
                    }
                });
            } else {
                console.warn('File not found, no need to delete:', oldImagePath); // Jika file tidak ditemukan
            }
        }
        console.log('Old image path:', oldImagePath);
        res.json({ success: true, imagePath: birthdayData.imagePath });
    } else {
        res.status(400).json({ success: false, message: 'No file uploaded' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));