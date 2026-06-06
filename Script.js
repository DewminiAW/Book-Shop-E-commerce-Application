    // ============================================================
    // ALL PRICES ARE IN SRI LANKAN RUPEES (Rs.)
    // No USD conversion - direct LKR prices
    // ============================================================

    function formatLKR(price) {
        // Format with commas for thousands and .00 format for rupees
        if (price === null || price === undefined) return "0.00";
        return Number(price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // BOOK DATASET - ALL PRICES IN SRI LANKAN RUPEES (Rs.)
    const booksCatalog = [
        { id: 101, title: "The Midnight Library", author: "Matt Haig", price: 5697.00, discountPrice: 4197.00, category: "Fiction", coverImage: "image/a.jpg" },
        { id: 102, title: "Atomic Habits", author: "James Clear", price: 6597.00, discountPrice: 5097.00, category: "Self-Help", coverImage: "image/b.jpg" },
        { id: 103, title: "Project Hail Mary", author: "Andy Weir", price: 7497.00, discountPrice: 5697.00, category: "Science Fiction", coverImage: "image/c.jpg" },
        { id: 104, title: "Dune", author: "Frank Herbert", price: 5997.00, discountPrice: null, category: "Sci-Fi", coverImage: "image/d.jpg" },
        { id: 105, title: "Becoming", author: "Michelle Obama", price: 6885.00, discountPrice: 5385.00, category: "Biography", coverImage: "image/e.jpg" },
        { id: 106, title: "The Silent Patient", author: "Alex Michaelides", price: 5097.00, discountPrice: 3897.00, category: "Thriller", coverImage: "image/a.jpg" },

           ];

    // Featured books (first 8)
    const featuredBooks = booksCatalog.slice(0, 8);

    function renderFeaturedBooks() {
        const container = document.getElementById('featuredBooksGrid');
        if (!container) return;

        const booksHTML = featuredBooks.map(book => {
            const finalPrice = book.discountPrice ? book.discountPrice : book.price;
            const hasDiscount = book.discountPrice !== null && book.discountPrice < book.price;
            const discountPercent = hasDiscount ? Math.round(((book.price - book.discountPrice) / book.price) * 100) : 0;

            return `
                <div class="col-md-3 col-sm-6 mb-4">
                    <div class="book-card">
                        ${hasDiscount ? `<div class="book-badge">🔥 -${discountPercent}% OFF</div>` : ''}
                        <div class="book-cover-wrapper">
                            <img src="${book.coverImage}" class="book-cover" alt="${escapeHtml(book.title)}"
                                 onerror="this.src='https://placehold.co/400x500/8B0000/white?text=Book+Cover'">
                        </div>
                        <div class="card-body">
                            <h6 class="book-title">${escapeHtml(book.title)}</h6>
                            <p class="book-author">by ${escapeHtml(book.author)}</p>
                            <div class="price-block">
                                <span class="book-price">Rs. ${formatLKR(finalPrice)}</span>
                                ${hasDiscount ? `<span class="old-price">Rs. ${formatLKR(book.price)}</span>` : ''}
                            </div>
                            <div class="d-flex gap-2 mt-auto">
                                <button class="btn-add-cart" onclick="addToCartHandler(${book.id})">
                                    <i class="fas fa-cart-plus"></i> Add
                                </button>
                                <button class="btn-view" onclick="quickViewBook(${book.id})">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = booksHTML;
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if(m === '&') return '&amp;';
            if(m === '<') return '&lt;';
            if(m === '>') return '&gt;';
            return m;
        });
    }

    function getBookById(bookId) {
        return booksCatalog.find(b => b.id === bookId);
    }

    function addToCartHandler(bookId) {
        const token = localStorage.getItem('authToken');
        if (!token) {
            const confirmLogin = confirm("Please sign in to add items to cart. Click OK to go to Sign In page.");
            if (confirmLogin) window.location.href = 'SignIn.html';
            return;
        }

        const book = getBookById(bookId);
        if (!book) {
            alert("Book not found");
            return;
        }

        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingIndex = cart.findIndex(item => item.id === book.id);

        if (existingIndex !== -1) {
            cart[existingIndex].quantity += 1;
        } else {
            const finalPriceLKR = book.discountPrice ? book.discountPrice : book.price;
            const cartItem = {
                id: book.id,
                title: book.title,
                author: book.author,
                price: finalPriceLKR,
                originalPrice: book.price,
                coverImage: book.coverImage,
                quantity: 1,
                hasDiscount: !!book.discountPrice,
                currency: "LKR"
            };
            cart.push(cartItem);
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCounter();
        showToastMessage(`${book.title} added to cart! (Rs. ${formatLKR(book.discountPrice || book.price)})`);
    }

    function quickViewBook(bookId) {
        const book = getBookById(bookId);
        if(book) {
            const displayPrice = book.discountPrice ? book.discountPrice : book.price;
            alert(`📖 ${book.title}\n✍️ ${book.author}\n💰 Rs. ${formatLKR(displayPrice)}\n✨ More details coming soon!`);
        } else {
            alert("Book details unavailable");
        }
    }

    function updateCartCounter() {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const totalQty = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        const badge = document.getElementById('cartCount');
        if (badge) badge.textContent = totalQty;
    }

    function performGlobalSearch() {
        const keyword = document.getElementById('globalSearchInput').value.trim();
        if (keyword) {
            window.location.href = `Search.html?keyword=${encodeURIComponent(keyword)}`;
        } else {
            alert("Please enter a book title or author");
        }
    }

    function checkUserAuthStatus() {
        const token = localStorage.getItem('authToken');
        const userMenu = document.getElementById('userMenu');
        if (token) {
            userMenu.innerHTML = `
                <li><a class="dropdown-item" href="my-account.html"><i class="fas fa-user-circle"></i> My Account</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="#" onclick="logoutUser()"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
            `;
        } else {
            userMenu.innerHTML = `
                <li><a class="dropdown-item" href="SignIn.html"><i class="fas fa-sign-in-alt"></i> Sign In</a></li>
                <li><a class="dropdown-item" href="SignUp.html"><i class="fas fa-user-plus"></i> Sign Up</a></li>
            `;
        }
        updateCartCounter();
    }

    function logoutUser() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.reload();
    }

    function showToastMessage(msg) {
        let toastDiv = document.createElement('div');
        toastDiv.innerText = msg;
        toastDiv.style.position = 'fixed';
        toastDiv.style.bottom = '25px';
        toastDiv.style.right = '25px';
        toastDiv.style.backgroundColor = '#8B0000';
        toastDiv.style.color = 'white';
        toastDiv.style.padding = '12px 24px';
        toastDiv.style.borderRadius = '50px';
        toastDiv.style.fontWeight = '600';
        toastDiv.style.zIndex = '9999';
        toastDiv.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
        document.body.appendChild(toastDiv);
        setTimeout(() => { toastDiv.style.opacity = '0'; setTimeout(() => toastDiv.remove(), 500); }, 2000);
    }

    document.addEventListener('DOMContentLoaded', () => {
        renderFeaturedBooks();
        checkUserAuthStatus();

        const searchInput = document.getElementById('globalSearchInput');
        if(searchInput) {
            searchInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') performGlobalSearch(); });
        }
    });

    window.addToCartHandler = addToCartHandler;
    window.quickViewBook = quickViewBook;
    window.performGlobalSearch = performGlobalSearch;
    window.logoutUser = logoutUser;
    window.formatLKR = formatLKR;







        // Sample book database

        let currentPage = 1;
        const itemsPerPage = 6;
        let filteredBooks = [...booksDatabase];

        function loadSearchResults() {
            const urlParams = new URLSearchParams(window.location.search);
            const keyword = urlParams.get('keyword');
            const category = urlParams.get('category');

            if (keyword) {
                document.getElementById('searchInput').value = keyword;
                filteredBooks = booksDatabase.filter(book =>
                    book.title.toLowerCase().includes(keyword.toLowerCase()) ||
                    book.author.toLowerCase().includes(keyword.toLowerCase())
                );
            } else if (category) {
                document.getElementById('category').value = category;
                filteredBooks = booksDatabase.filter(book => book.category === category);
            } else {
                filteredBooks = [...booksDatabase];
            }

            displayResults();
        }

        function applyFilters() {
            const category = document.getElementById('category').value;
            const minPrice = parseFloat(document.getElementById('minPrice').value);
            const maxPrice = parseFloat(document.getElementById('maxPrice').value);
            const sortBy = document.getElementById('sortBy').value;

            filteredBooks = [...booksDatabase];

            if (category) {
                filteredBooks = filteredBooks.filter(book => book.category === category);
            }

            if (minPrice) {
                filteredBooks = filteredBooks.filter(book => (book.discountPrice || book.price) >= minPrice);
            }

            if (maxPrice) {
                filteredBooks = filteredBooks.filter(book => (book.discountPrice || book.price) <= maxPrice);
            }

            if (sortBy === 'price_low') {
                filteredBooks.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
            } else if (sortBy === 'price_high') {
                filteredBooks.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
            } else if (sortBy === 'newest') {
                filteredBooks.sort((a, b) => b.year - a.year);
            }

            currentPage = 1;
            displayResults();
        }

        function resetFilters() {
            document.getElementById('category').value = '';
            document.getElementById('minPrice').value = '';
            document.getElementById('maxPrice').value = '';
            document.getElementById('sortBy').value = 'relevance';
            filteredBooks = [...booksDatabase];
            currentPage = 1;
            displayResults();
        }

        function displayResults() {
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedBooks = filteredBooks.slice(startIndex, endIndex);

            const resultsContainer = document.getElementById('searchResults');
            const noResultsDiv = document.getElementById('noResults');

            if (paginatedBooks.length === 0) {
                resultsContainer.innerHTML = '';
                noResultsDiv.style.display = 'block';
            } else {
                noResultsDiv.style.display = 'none';
                resultsContainer.innerHTML = paginatedBooks.map(book => `
                    <div class="col-md-4">
                        <div class="book-card">
                            <img src="${book.coverImage}" class="book-cover w-100" alt="${book.title}" onerror="this.src='https://via.placeholder.com/200x200?text=Book'">
                            <div class="book-info">
                                <h6 class="book-title">${book.title}</h6>
                                <p class="book-author">by ${book.author}</p>
                                <div class="book-price">
                                    $${book.discountPrice || book.price}
                                    ${book.discountPrice ? `<span class="old-price">$${book.price}</span>` : ''}
                                </div>
                                <button class="btn-add mt-2" onclick="addToCart(${book.id})">
                                    <i class="fas fa-shopping-cart"></i> Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('');
            }

            displayPagination();
        }

        function displayPagination() {
            const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
            const pagination = document.getElementById('pagination');

            if (totalPages <= 1) {
                pagination.innerHTML = '';
                return;
            }

            let html = '';
            for (let i = 1; i <= totalPages; i++) {
                html += `
                    <li class="page-item ${i === currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" onclick="changePage(${i}); return false;">${i}</a>
                    </li>
                `;
            }
            pagination.innerHTML = html;
        }

        function changePage(page) {
            currentPage = page;
            displayResults();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function addToCart(bookId) {
            let cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const book = booksDatabase.find(b => b.id === bookId);
            const existingItem = cart.find(item => item.id === bookId);

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ ...book, quantity: 1 });
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            alert('Book added to cart!');
            updateCartCount();
        }

        function updateCartCount() {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            document.getElementById('cartCount').textContent = totalItems;
        }

        // Initialize
        loadSearchResults();
        updateCartCount();
