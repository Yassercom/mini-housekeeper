const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const app = express();
const prisma = new PrismaClient();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ✅ GET /housekeepers (avec filtres)
app.get("/housekeepers", async (req, res) => {
  const { city, service } = req.query;
  let where = {};

  if (city) where.city = { contains: city, mode: "insensitive" };
  if (service) where.services = { has: service };

  const result = await prisma.housekeeper.findMany({ where });
  res.json(result);
});

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
