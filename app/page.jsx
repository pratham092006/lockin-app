import {
  ArrowLeft,
  ChevronDown,
  Drumstick,
  Flame,
  House,
  Plus,
  Salad,
  Search,
  Sparkles,
  Timer,
} from 'lucide-react';

const recipeCards = [
  {
    name: 'Blueberry Almond Smoothie',
    time: '10 Min',
    calories: '400 Cal',
    image:
      'https://images.unsplash.com/photo-1553530666-ba11a90e27f6?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Chicken and Quinoa Stuffed Peppers',
    time: '10 Min',
    calories: '400 Cal',
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Peanut Butter Banana Toast',
    time: '10 Min',
    calories: '400 Cal',
    image:
      'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Veggie and Turkey Stir-Fry',
    time: '10 Min',
    calories: '400 Cal',
    image:
      'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Greek Yogurt Pancakes',
    time: '10 Min',
    calories: '400 Cal',
    image:
      'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Citrus Zoodle Bowl',
    time: '10 Min',
    calories: '400 Cal',
    image:
      'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
  },
];

const mealRows = [
  {
    name: 'Lunch with two eggs',
    amount: '245g',
    macros: '24g 80g 121g',
    image:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Chicken and rice bowl',
    amount: '260g',
    macros: '34g 61g 77g',
    image:
      'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=300&q=80',
  },
];

function RecipeCard({ recipe }) {
  return (
    <article className="recipe-card">
      <img src={recipe.image} alt={recipe.name} />
      <div className="recipe-chip-row">
        <span className="chip">{recipe.time}</span>
        <span className="chip chip-soft">{recipe.calories}</span>
      </div>
      <h3>{recipe.name}</h3>
    </article>
  );
}

function MacroTile({ title, value, ringClass, icon }) {
  return (
    <article className="macro-tile">
      <div>
        <p className="macro-value">{value}</p>
        <p className="macro-title">{title}</p>
      </div>
      <span className={`macro-ring ${ringClass}`}>{icon}</span>
    </article>
  );
}

function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Main">
      <button className="tab-button tab-active" type="button">
        <House size={16} />
        <span>Home</span>
      </button>
      <button className="tab-button" type="button">
        <Salad size={16} />
        <span>Recipes</span>
      </button>
      <button className="tab-button" type="button">
        <Sparkles size={16} />
        <span>Progress</span>
      </button>
      <button className="fab" type="button" aria-label="Add meal">
        <Plus size={22} />
      </button>
    </nav>
  );
}

export default function Page() {
  return (
    <main className="showcase-wrap">
      <section className="showcase" aria-label="Nutrition app UI preview">
        <article className="phone-shell">
          <div className="phone-top-bar" />
          <div className="phone-body phone-home">
            <header className="home-header">
              <div>
                <p className="tiny-label">Dr.</p>
                <h1>
                  Cal
                  <span className="accent-dot" />
                </h1>
                <p className="goal">You will lose 2.1kg in 1 month</p>
              </div>
              <div className="header-actions">
                <button className="icon-circle icon-green" type="button" aria-label="Quick meal">
                  <Search size={15} />
                </button>
                <button className="avatar" type="button" aria-label="Profile" />
              </div>
            </header>

            <section className="calorie-card" aria-label="Calories left">
              <div>
                <p className="calories">3230</p>
                <p className="muted">Calories left</p>
              </div>
              <div className="ring-progress" aria-hidden="true">
                <Flame size={18} />
              </div>
            </section>

            <section className="macro-grid" aria-label="Macros">
              <MacroTile title="Protein left" value="300g" ringClass="ring-red" icon={<Drumstick size={14} />} />
              <MacroTile title="Carbs left" value="350g" ringClass="ring-yellow" icon={<Sparkles size={14} />} />
              <MacroTile title="Fat left" value="70g" ringClass="ring-green" icon={<Salad size={14} />} />
            </section>

            <section>
              <h2 className="section-title">Food intake</h2>
              <article className="scan-card">
                <img
                  src="https://images.unsplash.com/photo-1563379091339-03246963d29d?auto=format&fit=crop&w=200&q=80"
                  alt="Scanned meal"
                />
                <div>
                  <p>Failed to scan the food</p>
                  <button type="button">Scan again</button>
                </div>
              </article>

              <div className="meal-list">
                {mealRows.map((meal) => (
                  <article className="meal-row" key={meal.name}>
                    <img src={meal.image} alt={meal.name} />
                    <div>
                      <p>{meal.name}</p>
                      <small>{meal.amount}</small>
                    </div>
                    <span>{meal.macros}</span>
                  </article>
                ))}
              </div>
            </section>
          </div>
          <BottomNav />
        </article>

        <article className="phone-shell">
          <div className="phone-top-bar" />
          <div className="phone-body phone-recipes">
            <header className="recipes-header">
              <h2>Recipes</h2>
              <p>Choose recipe to cook</p>
            </header>

            <section className="recipes-grid" aria-label="Recipe cards">
              {recipeCards.map((recipe) => (
                <RecipeCard key={recipe.name} recipe={recipe} />
              ))}
            </section>
          </div>
        </article>

        <article className="phone-shell">
          <div className="phone-top-bar" />
          <div className="detail-image-wrap">
            <button className="icon-circle detail-back" type="button" aria-label="Back">
              <ArrowLeft size={16} />
            </button>
            <img
              src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80"
              alt="Coffee and cookie"
            />
          </div>
          <div className="phone-body detail-pane">
            <div className="time-badge">
              <Timer size={14} />
              10 Min
            </div>
            <h2>Blueberry Almond Smoothie</h2>

            <section className="nutrition-grid" aria-label="Nutrition facts">
              <article>
                <p>Calories</p>
                <strong>665</strong>
              </article>
              <article>
                <p>Carbs</p>
                <strong>665</strong>
              </article>
              <article>
                <p>Protein</p>
                <strong>665</strong>
              </article>
              <article>
                <p>Fat</p>
                <strong>665</strong>
              </article>
            </section>

            <section className="ingredients">
              <header>
                <h3>Ingredients</h3>
                <ChevronDown size={16} />
              </header>
              <div className="ingredient-row">
                <span>Fresh blueberries</span>
                <span>200g</span>
              </div>
            </section>
          </div>
        </article>
      </section>
    </main>
  );
}
