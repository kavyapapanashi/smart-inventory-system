# Smart Inventory System (Stockline)

Welcome to the Stockline Inventory System. 

**IMPORTANT NOTE FOR EVALUATORS/COORDINATORS:** 
This project has been upgraded from a static HTML prototype to a full **Next.js React Application** with a **Python Flask Backend**. 
Please **do not** open the `.html` files in the `frontend` folder directly in your browser. You must start the Next.js development server to view the new Aurora Dark Theme design and full functionality.

## Prerequisites
Make sure you have the following installed on your machine before running:
- **Node.js** (v18+)
- **Python** (v3.8+)
- **MongoDB** (must be installed and running locally on port 27017)

*Note: The environment `.env` files have been safely included in this repository so everything works instantly without extra configuration.*

## How to Run the Application

This project requires two terminals to run simultaneously: one for the Next.js frontend and one for the Python backend.

### 1. Start the Backend (Terminal 1)
Open a terminal and navigate to the `backend` folder:
```bash
cd backend

# Create and activate virtual environment (Windows)
python -m venv venv
venv\Scripts\activate

# Or on Mac/Linux
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the Flask backend server
python app.py
```
The backend should now be running on `http://localhost:5000`.

### 2. Start the Frontend (Terminal 2)
Open a second terminal and stay in the root project folder (where this `README.md` is located):
```bash
# Install Node.js dependencies
npm install

# Start the Next.js development server
npm run dev
```
The frontend should now be running. **Open [http://localhost:3000](http://localhost:3000) in your browser** to see the application.
