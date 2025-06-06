const dropdownBtn = document.getElementById('dropdownBtn');
const dropdownContent = document.getElementById('dropdownContent');
const dropdown = document.getElementById('myDropdown');

window.sharedData = window.sharedData || {};

dropdownBtn.addEventListener('click', () => {
dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
});

dropdownContent.querySelectorAll('div').forEach(item => {
    item.addEventListener('click', () => {
        dropdownBtn.querySelector('img').src = item.querySelector('img').src;
        dropdownContent.style.display = 'none';
        console.log('Selected:', item.querySelector('img').src);

        window.sharedData.plasterIMG = item.querySelector('img').src;
    });
});

// Close dropdown if clicking outside
document.addEventListener('click', (e) => {
    if (e.target instanceof Node && !dropdown.contains(e.target)) {
        dropdownContent.style.display = 'none';
    }
});