
// server.js
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/calculate', (req, res) => {
    const { people, subTotal, total } = req.body;

    if (!people || !subTotal || !total || subTotal > total) {
        return res.status(400).json({ error: 'Invalid input' });
    }

    const vat = total - subTotal;

    const orderTotals = people.map(p => {
        const sum = p.orders.reduce((acc, cur) => acc + parseFloat(cur || 0), 0);
        return { name: p.name, total: sum };
    });

    const totalOrders = orderTotals.reduce((acc, p) => acc + p.total, 0);

    if (Math.abs(totalOrders - subTotal) > 2) {
        return res.status(400).json({ error: 'Sub-total mismatch with order values' });
    }

    const result = orderTotals.map(p => {
        const percentage = p.total / totalOrders;
        const vatShare = percentage * vat;
        const totalToPay = Math.round(p.total + vatShare);

        return {
            name: p.name,
            orderTotal: parseFloat(p.total.toFixed(2)),
            vat: parseFloat(vatShare.toFixed(2)),
            totalToPay: parseFloat(totalToPay.toFixed(2))
        };
    });

    res.json(result);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
