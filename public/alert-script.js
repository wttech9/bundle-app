(function () {
    // Load custom CSS
    const customCssLink = document.createElement('link');
    customCssLink.rel = 'stylesheet';
    customCssLink.href = 'https://cd01-49-205-246-217.ngrok-free.app/custom.css';
    document.head.appendChild(customCssLink);

    // Function to inject bundle product details into the page using div and other HTML tags
    function injectBundleProducts(products, totalPrice, originalPrice, savings) {
        // Create a container for the bundle with the flex wrapper
        const bundleContainer = document.createElement('div');
        bundleContainer.className = 'bundle-container'; // New container for centering
        const innerWrapper = document.createElement('div');
        innerWrapper.className = 'bndlbody';

        innerWrapper.innerHTML = `
            <div class="title-shop"> <p>Buy Bundle and Get 20% off</p></div>

            <div class="main bd-grid ">
        `;

        // Loop through the product data and create HTML for each product
        products.forEach((product, index) => {
            const productHTML = `
                <article class="bndlcard ">
                    <div class="bndlcard__img">
                        <img src="${product.imageSrc}" alt="${product.name}">
                    </div>
                    <div>
                        <span class="product-title">${product.name}</span></div>
                    <div class="bndlcard__precis">
                        <div>
                        <span class="bndlcard__preci bndlcard__preci--before">$${product.price}</span>
                        <span class="bndlcard__preci bndlcard__preci--now">$${product.discountPrice}</span>
                        </div>
                    </div>
                </article>
            `;

            // Append each product to the custom products wrapper
            innerWrapper.querySelector('.bd-grid').innerHTML += productHTML;

            // Add the "+" symbol after each product, except the last one
            if (index < products.length - 1) {
                const plusHTML = `<div id="plus"></div>`;
                innerWrapper.querySelector('.bd-grid').innerHTML += plusHTML;
            }
        });

        // Append the inner wrapper to the bundle container
        bundleContainer.appendChild(innerWrapper);

        // Create the price banner using the provided pre-calculated values
        const priceBanner = `
        <div style="flex-basis:100%;text-align: center;">
            <p style="font-size:20px;font-weight:600; margin:10px 0;"> 
                Total Price $${totalPrice.toFixed(2)} 
                <span style="text-decoration: line-through; font-weight:400;color:#ccc">$${originalPrice.toFixed(2)}</span> 
                Save $${savings.toFixed(2)}
            </p>
        </div>
        <button id="add-to-cart-btn" class="bndlcard-button">Add to Cart</button>`;
        
        innerWrapper.querySelector('.bd-grid').innerHTML += priceBanner;

        // Append the bundle container to a specific section in the product page
        const mainContent = document.querySelector('#MainContent');
        const firstSection = mainContent.querySelector('section');
        if (firstSection) {
            firstSection.appendChild(bundleContainer);  // Add the div as the last child inside the product__info-wrapper
        }

        // Add event listener to "Add to Cart" button
        document.getElementById('add-to-cart-btn').addEventListener('click', () => {
            addBundleToCart(products);
        });
    }

    // Function to add the bundle to Shopify cart
    function addBundleToCart(products) {
        // Loop through each product and add it to the cart using Shopify's AJAX API
        const items = products.map(product => ({
            id: product.variantId, // Use the variant ID of the product
            quantity: 1
        }));

        fetch('/cart/add.js', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ items })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Products added to cart:', data);
            window.location.href = '/cart'; // Redirect to the cart page
        })
        .catch(error => {
            console.error('Error adding products to cart:', error);
        });
    }

    // Fetch product data (this could be done via Shopify Storefront API)
    function fetchBundleProducts() {
        // Example product data (replace with actual Storefront API data)
        const products = [
            {
                name: 'Gift Card',
                imageSrc: '//cdn.shopify.com/s/files/1/0704/6915/7091/files/Main_b13ad453-477c-4ed1-9b43-81f3345adfd6.jpg?v=1727882688',
                price: '749.95',
                discountPrice: '599.96', // Example discounted price
                variantId: '45574215500003' // Replace with actual variant ID
            },
            {
                name: 'Selling Plans Ski Wax',
                imageSrc: '//cdn.shopify.com//s//files//1//0704//6915//7091//files//Main_589fc064-24a2-4236-9eaf-13b2bd35d21d.jpg',
                price: '699.95',
                discountPrice: '559.96', // Example discounted price
                variantId: '45574214779107' // Replace with actual variant ID
            }
        ];

        // Pre-calculated values for total price, original price, and savings
        const totalPrice = 17.00;  // Discounted total price
        const originalPrice = 33.00;  // Original total price
        const savings = 16.00;  // Amount saved

        // Call the function to inject products into the page, passing the calculated prices
        injectBundleProducts(products, totalPrice, originalPrice, savings);
    }

    // Execute the script on product page
    if (window.location.pathname.includes('/products/')) {
        fetchBundleProducts();
    }
})();
