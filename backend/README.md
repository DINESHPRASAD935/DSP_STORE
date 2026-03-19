# DSP Store Backend

Django REST Framework backend for the Affiliate Products Website.

## Setup Instructions

1. **Create and activate virtual environment:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Run migrations:**
```bash
python manage.py makemigrations
python manage.py migrate
```

4. **Create superuser (for admin access):**
```bash
python manage.py createsuperuser
```

5. **Load initial data (optional):**
```bash
python manage.py loaddata initial_data.json  # If you create this
```

6. **Run development server (port 9000):**
```bash
python manage.py runserver 9000
```
Or for production: `gunicorn dsp_store.wsgi:application --bind 0.0.0.0:9000`

The API will be available at `http://localhost:9000/api/`

## API Endpoints

### Products
- `GET /api/products/` - List all active products
- `GET /api/products/:id/` - Get product details
- `POST /api/products/` - Create new product
- `PUT /api/products/:id/` - Update product
- `PATCH /api/products/:id/` - Partial update
- `DELETE /api/products/:id/` - Delete product
- `POST /api/products/:id/archive/` - Archive product
- `POST /api/products/:id/unarchive/` - Unarchive product
- `GET /api/products/archived/` - Get all archived products

### Categories
- `GET /api/categories/` - List all categories
- `GET /api/categories/:id/` - Get category details

## Query Parameters

### Products List
- `?category=Audio` - Filter by category name
- `?search=keyword` - Search in name, tagline, description
- `?page=1` - Pagination
- `?ordering=-created_at` - Order by field
- `?exclude_id=1` - Exclude product ID (for related products)
