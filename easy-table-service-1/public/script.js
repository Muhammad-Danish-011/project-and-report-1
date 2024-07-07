document.addEventListener('DOMContentLoaded', () => {
    const addToBasketButtons = document.querySelectorAll('.add-to-basket');

    addToBasketButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const productName = event.target.dataset.productName;

            fetch(`/add-to-basket/${encodeURIComponent(productName)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productName })
            })
            .then(response => {
                if (response.ok) {
                    console.log('Product added to basket');
                    updateBasketCount(); // Update basket count in header
                } else {
                    console.error('Failed to add product to basket');
                }
            })
            .catch(error => {
                console.error('Error adding product to basket:', error);
            });
        });
    });

    function updateBasketCount() {
        fetch('/basket-count')
        .then(response => response.json())
        .then(data => {
            document.querySelector('.basket a').textContent = `Basket (${data.basketCount})`;
        })
        .catch(error => {
            console.error('Error updating basket count:', error);
        });
    }
});
