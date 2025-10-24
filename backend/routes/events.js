const express = require('express');
const router = express.Router();

// Dữ liệu giả lập
const mockEvents = [
    { id: 1, title: 'Phiên chợ gây quỹ nhận nuôi' }
];

router.get('/', (req, res) => {
    res.json(mockEvents);
});

router.get('/:id', (req, res) => {
    const event = mockEvents.find(e => e.id === parseInt(req.params.id));
    if (event) res.json(event);
    else res.status(404).json({ message: 'Không tìm thấy sự kiện' });
});

module.exports = router;  