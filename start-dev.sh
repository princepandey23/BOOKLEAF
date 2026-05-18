#!/bin/bash
echo "Starting BookLeaf Portal..."
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""

# Start backend
cd backend && npm run dev &
BACKEND_PID=$!
echo "Backend started (PID: $BACKEND_PID)"

sleep 3

# Start frontend
cd ../frontend && npm start &
FRONTEND_PID=$!
echo "Frontend started (PID: $FRONTEND_PID)"

echo ""
echo "Both servers running."
echo "Login: admin@bookleaf.com / admin123"
echo "Press Ctrl+C to stop both servers."

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
