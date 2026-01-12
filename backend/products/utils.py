"""
Utility functions for products app
"""


def normalize_array_response(data):
    """
    Normalizes API response to array format.
    Handles both paginated (results) and non-paginated responses.
    
    Args:
        data: API response data (can be list, dict with 'results', or other)
    
    Returns:
        list: Normalized array of items
    """
    if isinstance(data, list):
        return data
    if isinstance(data, dict) and 'results' in data:
        return data.get('results', [])
    return []


def build_product_query_params(request, base_params=None):
    """
    Builds query parameters for product API requests.
    
    Args:
        request: Django request object
        base_params: Optional base parameters dict
    
    Returns:
        dict: Query parameters for product API
    """
    params = base_params or {}
    
    category = request.query_params.get('category', None)
    if category and category != 'All':
        try:
            category_id = int(category)
            params['category'] = category_id
        except (ValueError, TypeError):
            params['category'] = category
    
    search_query = request.query_params.get('search', '').strip()
    if search_query:
        params['search'] = search_query
    
    exclude_id = request.query_params.get('exclude_id', None)
    if exclude_id:
        try:
            params['exclude_id'] = int(exclude_id)
        except (ValueError, TypeError):
            pass
    
    return params


def get_category_name(category):
    """
    Normalizes category name for display.
    Handles both string and object formats.
    
    Args:
        category: Category as string or dict with 'name' key
    
    Returns:
        str: Category name
    """
    if isinstance(category, str):
        return category
    if isinstance(category, dict) and 'name' in category:
        return category['name']
    if hasattr(category, 'name'):
        return category.name
    return str(category)
