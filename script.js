
const mealsEl= document.getElementById("meals");
const favoriteContainer=document.getElementById("fav-meals");
const searchTerm = document.getElementById("search-term");
const searchBtn= document.getElementById("search");
const mealPopup=document.getElementById("meal-popup");
const mealInfoEl=document.getElementById("meal-info");
const popupCloseBtn=document.getElementById("close-popup");
const popupLikedBtn=document.getElementById("liked");

getRandomMeal();
fetchFavMeals();

async function getRandomMeal() {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
    const respData = await resp.json();
    const randomMeal = respData.meals[0];

    addMeal(randomMeal, true);
}

async function getMealById(id) {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id);
    const respData= await resp.json();
    const meal=respData.meals[0];
    return meal;
}

async function getMealsBySearch(term) {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' + term);
    const respData=await resp.json();
    const meals=respData.meals;
    return meals; 
}

function addMeal(mealData, random = false) {
    const meal = document.createElement('div');
    meal.classList.add('meal');
    meal.innerHTML = `
        <div class="meal-header" id="meal-header">
            ${random? `<span class="random">🙂랜덤 추천🙂</span>` :  ''}
            <img 
                src="${mealData.strMealThumb}" 
                alt="${mealData.strMeal}"
            />
        </div>
        <div class="meal-body">
            <h4>${mealData.strMeal}</h4>
            <button class="fav-btn" onClick="">
                <i class="fas fa-heart"></i>
            </button>
        </div>
    `;
    meals.appendChild(meal);
    meal.addEventListener('click', ()=>{
        showMealInfo(mealData);
    })
    
    const btn=meal.querySelector('.meal-body .fav-btn')
    btn.addEventListener("click", (e)=>{
        if (btn.classList.contains('active')){
            removeMealLS(mealData.idMeal);
            btn.classList.remove("active");
            console.log("remove");
            btn.style.color="rgb(197,188,188)";
        }
        else{
            addMealLS(mealData.idMeal);
            btn.classList.add("active");
            console.log("active");
            btn.style.color="salmon";
        }
        fetchFavMeals();
    })
}
function removeMealLS(mealId){
    const mealIds = getMealsLS();

    localStorage.setItem('mealIds', JSON.stringify(mealIds.filter((id)=>id!==mealId)));
}

function addMealLS(mealId){
    const mealIds = getMealsLS();

    localStorage.setItem('mealIds', JSON.stringify([...mealIds,mealId]));
}

function getMealsLS() {
    const mealIds=JSON.parse(localStorage.getItem('mealIds'));
    return mealIds === null ? []: mealIds; // json에 아무것도 없을 때는 빈 array return
}

async function fetchFavMeals(){
    favoriteContainer.innerHTML="";
    const mealIds=getMealsLS();
    const meals=[];
    for (let i=0; i<mealIds.length; i++){
        const mealId = mealIds[i];

        meal= await getMealById(mealId);
        showFavMeal(meal);
    }

    /* add them to the screen*/
}

function showFavMeal(mealData){

    const favmeal=document.createElement("li");
    favmeal.innerHTML=`
        <img 
            src="${mealData.strMealThumb}" 
            alt="${mealData.strMeal}">
        <span><br>${mealData.strMeal}</span>
        <button class="clear"><i class="fas fa-times"></i></button>
        `
    const btn=favmeal.querySelector(".clear");

    favmeal.addEventListener("click",()=>{
        showMealInfo(mealData);
    })
    btn.addEventListener("click", ()=>{
        removeMealLS(mealData.idMeal);
        fetchFavMeals();
    });

    favoriteContainer.appendChild(favmeal);
}

searchBtn.addEventListener('click', async ()=>{
    //clean container
    mealsEl.innerHTML="";

    const search=searchTerm.value;
    const meals = await getMealsBySearch(search)
    if(meals){
        meals.forEach(meal=>{
            addMeal(meal,false);
        })
    }
})


function showMealInfo(mealData){
    //clean it up
    mealInfoEl.innerHTML='';

    //update the Meal Info
    const mealEl=document.createElement('div');
    mealInfoEl.appendChild(mealEl);
    mealEl.innerHTML= `
        <h1>${mealData.strMeal}</h1>
        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}}">
        <h3> 레시피 </h3>
        <p>
            ${mealData.strInstructions}
        </p>
    `
    //show the popup
    mealPopup.classList.remove('hidden');
    popupLikedBtn.addEventListener("click",()=>{
        addMealLS(mealData.idMeal);
        popupLikedBtn.style.color='salmon';
        mealPopup.classList.add('hidden');
        fetchFavMeals()
    })
}




popupCloseBtn.addEventListener('click', ()=>{
    mealPopup.classList.add('hidden');

})

