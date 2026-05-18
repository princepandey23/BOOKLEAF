#!/bin/bash
echo "========================================"
echo "   BookLeaf Publishing Portal Setup"
echo "========================================"
echo ""

echo "[1/3] Installing backend dependencies..."
cd backend && npm install
if [ $? -ne 0 ]; then echo "Backend install failed!"; exit 1; fi
cd ..

echo ""
echo "[2/3] Installing frontend dependencies..."
cd frontend && npm install
if [ $? -ne 0 ]; then echo "Frontend install failed!"; exit 1; fi
cd ..

echo ""
echo "[3/3] Seeding database..."
cd backend && npm run seed
cd ..

echo ""
echo "========================================"
echo " Setup Complete! Now run: ./start-dev.sh"
echo "========================================"
