// Base URL for the items API
const API_URL = '/api/items';

// Tracking variables for editing
let isEditing = false;
let currentItemId = null;

// Getting DOM elements
const itemForm = document.getElementById('itemForm');
const itemNameInput = document.getElementById('itemName');
const itemPriceInput = document.getElementById('itemPrice');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const nameError = document.getElementById('nameError');
const priceError = document.getElementById('priceError');
const itemsTableBody = document.getElementById('itemsTableBody');

// Run when the page loads
document.addEventListener('DOMContentLoaded', () => {
  loadItems();
  
  // Form submission handler
  itemForm.addEventListener('submit', handleFormSubmit);

  // Cancel edit handler
  cancelBtn.addEventListener('click', resetForm);

  // Clear errors while typing
  itemNameInput.addEventListener('input', () => {
    itemNameInput.classList.remove('input-error');
    nameError.textContent = '';
  });

  itemPriceInput.addEventListener('input', () => {
    itemPriceInput.classList.remove('input-error');
    priceError.textContent = '';
  });
});

// Fetch all items from the server
async function loadItems() {
  try {
    const res = await fetch(API_URL);
    const items = await res.json();
    renderTable(items);
  } catch (err) {
    console.error('Error fetching items:', err);
    itemsTableBody.innerHTML = `
      <tr>
        <td colspan="4" class="no-items-cell" style="color: #ef4444;">Failed to load items from server.</td>
      </tr>
    `;
  }
}

// Display items inside the table
function renderTable(items) {
  itemsTableBody.innerHTML = '';

  // Show message if array is empty
  if (!items || items.length === 0) {
    itemsTableBody.innerHTML = `
      <tr>
        <td colspan="4" class="no-items-cell">No items yet</td>
      </tr>
    `;
    return;
  }

  // Create table rows for each item
  items.forEach(item => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${item.id}</td>
      <td>${escapeHtml(item.name)}</td>
      <td>₹${Number(item.price).toFixed(2)}</td>
      <td>
        <div class="action-buttons">
          <button type="button" class="btn btn-edit" data-id="${item.id}">Edit</button>
          <button type="button" class="btn btn-delete" data-id="${item.id}">Delete</button>
        </div>
      </td>
    `;

    // Attach click events for edit and delete
    const editBtn = tr.querySelector('.btn-edit');
    const deleteBtn = tr.querySelector('.btn-delete');

    editBtn.addEventListener('click', () => startEdit(item));
    deleteBtn.addEventListener('click', () => deleteItem(item.id));

    itemsTableBody.appendChild(tr);
  });
}

// Handle adding or updating an item
async function handleFormSubmit(e) {
  e.preventDefault();

  const name = itemNameInput.value.trim();
  const price = itemPriceInput.value.trim();

  // Validate form inputs
  if (!validateForm(name, price)) {
    return;
  }

  const payload = {
    name: name,
    price: Number(price)
  };

  try {
    if (isEditing) {
      // Update existing item
      const res = await fetch(`${API_URL}/${currentItemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Update failed');
        return;
      }
    } else {
      // Add new item
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to add item');
        return;
      }
    }

    // Reset form and reload items
    resetForm();
    loadItems();
  } catch (err) {
    console.error('Error saving item:', err);
  }
}

// Populate form fields to edit an item
function startEdit(item) {
  isEditing = true;
  currentItemId = item.id;

  itemNameInput.value = item.name;
  itemPriceInput.value = item.price;

  submitBtn.textContent = 'Update';
  cancelBtn.style.display = 'inline-block';

  itemNameInput.classList.remove('input-error');
  nameError.textContent = '';
  itemPriceInput.classList.remove('input-error');
  priceError.textContent = '';

  itemNameInput.focus();
}

// Delete item with confirmation
async function deleteItem(id) {
  const confirmDelete = confirm('Are you sure?');
  if (!confirmDelete) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });

    if (res.ok) {
      // Reset form if deleted item was being edited
      if (isEditing && currentItemId === id) {
        resetForm();
      }
      loadItems();
    } else {
      const err = await res.json();
      alert(err.error || 'Delete failed');
    }
  } catch (err) {
    console.error('Error deleting item:', err);
  }
}

// Validate name and price fields
function validateForm(name, price) {
  let isValid = true;

  // Name validation
  if (!name) {
    itemNameInput.classList.add('input-error');
    nameError.textContent = 'Name must not be empty.';
    isValid = false;
  } else {
    itemNameInput.classList.remove('input-error');
    nameError.textContent = '';
  }

  // Price validation
  const num = Number(price);
  if (!price || isNaN(num) || num <= 0) {
    itemPriceInput.classList.add('input-error');
    priceError.textContent = 'Price must be a positive number.';
    isValid = false;
  } else {
    itemPriceInput.classList.remove('input-error');
    priceError.textContent = '';
  }

  return isValid;
}

// Reset form back to normal state
function resetForm() {
  itemForm.reset();
  isEditing = false;
  currentItemId = null;
  submitBtn.textContent = 'Submit';
  cancelBtn.style.display = 'none';

  itemNameInput.classList.remove('input-error');
  nameError.textContent = '';
  itemPriceInput.classList.remove('input-error');
  priceError.textContent = '';
}

// Simple HTML escaping to prevent XSS
function escapeHtml(str) {
  const p = document.createElement('p');
  p.textContent = str;
  return p.innerHTML;
}
