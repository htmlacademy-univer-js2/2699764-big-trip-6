import AbstractView from '../framework/view/abstract-view.js';
import { SortType } from '../const.js';

const createSortingTemplate = (currentSort) => `
  <form class="trip-events__trip-sort trip-sort" action="#" method="get">
    <div class="trip-sort__item trip-sort__item--day">
      <input id="sort-day" class="trip-sort__input visually-hidden" type="radio" name="trip-sort" value="${SortType.DAY}" data-sort-type="day" ${currentSort === SortType.DAY ? 'checked' : ''}>
      <label class="trip-sort__btn" for="sort-day">Day</label>
    </div>
    <div class="trip-sort__item trip-sort__item--event">
      <input id="sort-event" class="trip-sort__input visually-hidden" type="radio" name="trip-sort" value="${SortType.EVENT}" data-sort-type="event" disabled>
      <label class="trip-sort__btn" for="sort-event">Event</label>
    </div>
    <div class="trip-sort__item trip-sort__item--time">
      <input id="sort-time" class="trip-sort__input visually-hidden" type="radio" name="trip-sort" value="${SortType.TIME}" data-sort-type="time" ${currentSort === SortType.TIME ? 'checked' : ''}>
      <label class="trip-sort__btn" for="sort-time">Time</label>
    </div>
    <div class="trip-sort__item trip-sort__item--price">
      <input id="sort-price" class="trip-sort__input visually-hidden" type="radio" name="trip-sort" value="${SortType.PRICE}" data-sort-type="price" ${currentSort === SortType.PRICE ? 'checked' : ''}>
      <label class="trip-sort__btn" for="sort-price">Price</label>
    </div>
    <div class="trip-sort__item trip-sort__item--offer">
      <input id="sort-offer" class="trip-sort__input visually-hidden" type="radio" name="trip-sort" value="${SortType.OFFER}" data-sort-type="offer" disabled>
      <label class="trip-sort__btn" for="sort-offer">Offers</label>
    </div>
  </form>
`;

export default class SortingView extends AbstractView {
  #currentSort = SortType.DAY;
  #onSortChange = null;

  constructor(currentSort = SortType.DAY, onSortChange) {
    super();
    this.#currentSort = currentSort;
    this.#onSortChange = onSortChange;
    this.element.addEventListener('change', this.#handleSortChange);
  }

  get template() {
    return createSortingTemplate(this.#currentSort);
  }

  #handleSortChange = (evt) => {
    evt.preventDefault();
    const sortType = evt.target.dataset.sortType;
    if (sortType && this.#currentSort !== sortType && this.#onSortChange) {
      this.#currentSort = sortType;
      this.#onSortChange(sortType);
    }
  };

  updateSort(selectedSort) {
    if (!selectedSort) {
      return;
    }
    this.#currentSort = selectedSort;
    const inputs = this.element.querySelectorAll('.trip-sort__input');
    inputs.forEach((input) => {
      input.checked = input.value === selectedSort;
    });
  }
}
