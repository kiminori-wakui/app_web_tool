document.addEventListener('DOMContentLoaded', function() {
    const appId = 'xxxxxx';
    const categoriesContainer = document.getElementById('categories');
    const recipesContainer = document.getElementById('recipes');

    async function fetchCategories() {
        try {
            const response = await fetch(`https://app.rakuten.co.jp/services/api/Recipe/CategoryList/20170426?applicationId=${appId}`);
            const data = await response.json();
            const categories = data.result.large;
            displayCategories(categories);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }

    function displayCategories(categories) {
        categoriesContainer.innerHTML = '';
        categories.forEach(category => {
            const tag = document.createElement('div');
            tag.className = 'tag';
            tag.textContent = category.categoryName;
            tag.dataset.categoryId = category.categoryId;
            tag.addEventListener('click', () => fetchRecipes(category.categoryId));
            categoriesContainer.appendChild(tag);
        });
    }

    async function fetchRecipes(categoryId) {
        try {
            const response = await fetch(`https://app.rakuten.co.jp/services/api/Recipe/CategoryRanking/20170426?applicationId=${appId}&categoryId=${categoryId}`);
            const data = await response.json();
            const recipes = data.result;
            displayRecipes(recipes);
        } catch (error) {
            console.error('Error fetching recipes:', error);
        }
    }

    function displayRecipes(recipes) {
        recipesContainer.innerHTML = '';
        recipes.forEach(recipe => {
            const card = document.createElement('div');
            card.className = 'recipe-card';
            card.innerHTML = `
                <img src="${recipe.foodImageUrl}" alt="${recipe.recipeTitle}">
                <h2>${recipe.recipeTitle}</h2>
                <p>${recipe.recipeDescription}</p>
            `;
            card.addEventListener('click', () => {
                window.open(recipe.recipeUrl, '_blank');
            });
            recipesContainer.appendChild(card);
        });
    }

    fetchCategories();
});
